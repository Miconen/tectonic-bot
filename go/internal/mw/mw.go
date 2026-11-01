// Package mw holds the router middleware that replaces the discordx guards
// (LoggingGuard, IsHealthy, RequiresGuild, IsAdmin).
package mw

import (
	"errors"
	"time"

	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/handler"

	"github.com/Miconen/tectonic-bot/go/internal/logging"
	"github.com/Miconen/tectonic-bot/go/internal/reply"
	"github.com/Miconen/tectonic-bot/go/internal/str"
	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
)

// Context gives every interaction a correlation ID and reply state, and logs
// how long it took (LoggingGuard in TS). Register it first.
func Context(next handler.Handler) handler.Handler {
	return func(e *handler.InteractionEvent) error {
		ctx, _ := logging.WithCorrelationID(e.Ctx)
		e.Ctx = reply.Track(ctx)

		log := logging.Logger(e.Ctx).With("user", e.User().ID, "type", e.Type())
		if e.GuildID() != nil {
			log = log.With("guild", *e.GuildID())
		}
		if i, ok := e.Interaction.(discord.ApplicationCommandInteraction); ok {
			log = log.With("command", i.Data.CommandName())
		}

		start := time.Now()
		err := next(e)
		log.Info("interaction handled", "duration", time.Since(start), "failed", err != nil)
		return err
	}
}

// ReplyErrors turns any error a command returns into an ephemeral reply, so
// handlers can simply `return err`. Register it right after Context.
func ReplyErrors(next handler.Handler) handler.Handler {
	return func(e *handler.InteractionEvent) error {
		err := next(e)
		if err == nil {
			return nil
		}

		var userErr reply.UserError
		if !errors.As(err, &userErr) {
			logging.Logger(e.Ctx).Error("command failed", "err", err)
		}

		// Autocomplete and other interaction types can't take a message reply.
		if e.Type() != discord.InteractionTypeApplicationCommand {
			return nil
		}
		return reply.Ephemeral(e.Ctx, e, reply.MessageFor(e.Ctx, err))
	}
}

// RequireGuild rejects interactions outside a server (RequiresGuild in TS).
func RequireGuild(next handler.Handler) handler.Handler {
	return func(e *handler.InteractionEvent) error {
		if e.GuildID() == nil {
			return reply.UserError(str.NoGuild)
		}
		return next(e)
	}
}

// APIHealthy rejects commands while the API is unreachable (IsHealthy in TS).
func APIHealthy(api *tectonic.Client) handler.Middleware {
	return func(next handler.Handler) handler.Handler {
		return func(e *handler.InteractionEvent) error {
			if e.Type() == discord.InteractionTypeApplicationCommand && !api.Healthy(e.Ctx) {
				return reply.UserError(str.APIHealth)
			}
			return next(e)
		}
	}
}

// RequireAdmin requires Moderate Members (IsAdmin in TS).
func RequireAdmin(next handler.Handler) handler.Handler {
	return func(e *handler.InteractionEvent) error {
		m := e.Member()
		if m == nil || !m.Permissions.Has(discord.PermissionModerateMembers) {
			return reply.UserError(str.AdminRequired)
		}
		return next(e)
	}
}
