// Package mw holds the router middleware that replaces the discordx guards
// (LoggingGuard, IsHealthy, RequiresGuild, IsAdmin).
package mw

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/handler"

	"github.com/Miconen/tectonic-bot/go/internal/logging"
	"github.com/Miconen/tectonic-bot/go/internal/reply"
	"github.com/Miconen/tectonic-bot/go/internal/str"
	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
)

// Context gives every interaction a correlation ID (its interaction ID, which
// is also the Error ID users see) and reply state, logs the command with its
// option values, and logs how long it took (LoggingGuard in TS). Register it
// first.
func Context(next handler.Handler) handler.Handler {
	return func(e *handler.InteractionEvent) error {
		e.Ctx = reply.Track(logging.WithID(e.Ctx, e.ID().String()))

		log := logging.Logger(e.Ctx).With("user", e.User().ID, "type", e.Type())
		if e.GuildID() != nil {
			log = log.With("guild", *e.GuildID())
		}

		switch i := e.Interaction.(type) {
		case discord.ApplicationCommandInteraction:
			if data, ok := i.Data.(discord.SlashCommandInteractionData); ok {
				log = log.With("command", data.CommandPath())
				log.Info("Command started", "options", OptionValues(data))
			} else {
				log = log.With("command", i.Data.CommandName())
				log.Info("Command started")
			}
		case discord.AutocompleteInteraction:
			// Debug only: free-text input volume and privacy are an open
			// question in #171.
			f := i.Data.Focused()
			log = log.With("command", i.Data.CommandPath())
			log.Debug("Autocomplete", "option", f.Name, "value", f.String())
		}

		start := time.Now()
		err := next(e)
		log.Info("Interaction handled", "duration", time.Since(start), "failed", err != nil)
		return err
	}
}

// OptionValues renders a slash command's options for logging, with users and
// roles shown as "id (name)" so logs can be read without looking IDs up.
func OptionValues(data discord.SlashCommandInteractionData) map[string]string {
	out := make(map[string]string, len(data.Options))
	for name, opt := range data.Options {
		v := strings.Trim(string(opt.Value), `"`)
		switch opt.Type {
		case discord.ApplicationCommandOptionTypeUser:
			if u, ok := data.OptUser(name); ok {
				v = fmt.Sprintf("%s (%s)", u.ID, u.Username)
			}
		case discord.ApplicationCommandOptionTypeRole:
			if r, ok := data.OptRole(name); ok {
				v = fmt.Sprintf("%s (%s)", r.ID, r.Name)
			}
		}
		out[name] = v
	}
	return out
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
				return reply.SystemError(str.APIHealth)
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
