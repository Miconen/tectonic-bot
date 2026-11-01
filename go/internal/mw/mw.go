// Package mw holds the router middleware that replaces the discordx guards
// (LoggingGuard, IsHealthy, RequiresGuild, IsAdmin).
package mw

import (
	"errors"
	"fmt"
	"log/slog"
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
		ctx := logging.WithActor(logging.WithID(e.Ctx, e.ID().String()), e.User().ID.String())
		ctx = logging.With(ctx, "username", e.User().Username, "type", typeName(e.Type()))
		if e.GuildID() != nil {
			ctx = logging.With(ctx, "guild_id", e.GuildID().String())
		}

		// Name what was used before logging, so every later line (API calls,
		// warnings, the error) says which command it belongs to.
		var log func(*slog.Logger)
		switch i := e.Interaction.(type) {
		case discord.ApplicationCommandInteraction:
			if data, ok := i.Data.(discord.SlashCommandInteractionData); ok {
				ctx = logging.With(ctx, "command", data.CommandPath())
				log = func(l *slog.Logger) { l.Info("Command started", "options", OptionValues(data)) }
			} else {
				ctx = logging.With(ctx, "command", i.Data.CommandName())
				log = func(l *slog.Logger) { l.Info("Command started") }
			}
		case discord.ComponentInteraction:
			// Button custom IDs are routes like /request/accept/<id>, so the
			// log says which action it was (#165).
			ctx = logging.With(ctx, "component", i.Data.CustomID())
			log = func(l *slog.Logger) { l.Info("Component used") }
		case discord.AutocompleteInteraction:
			// Debug only: free-text input volume and privacy are an open
			// question in #171.
			f := i.Data.Focused()
			ctx = logging.With(ctx, "command", i.Data.CommandPath())
			log = func(l *slog.Logger) { l.Debug("Autocomplete", "option", f.Name, "value", f.String()) }
		}
		e.Ctx = reply.Track(ctx)
		l := logging.Logger(e.Ctx)
		if log != nil {
			log(l)
		}

		start := time.Now()
		err := next(e)
		l.Info("Interaction handled", "duration_ms", time.Since(start).Milliseconds(), "failed", err != nil)
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

		// Log what the user was told too: "they said the bot refused" is the
		// usual starting point when diagnosing a report.
		msg := reply.MessageFor(e.Ctx, err)
		var userErr reply.UserError
		if errors.As(err, &userErr) {
			logging.Logger(e.Ctx).Info("Rejected", "reply", msg)
		} else {
			logging.Logger(e.Ctx).Error("Command failed", "err", err, "reply", msg)
		}

		// Autocomplete can't take a message reply.
		if !canReply(e) {
			return nil
		}
		return reply.Ephemeral(e.Ctx, e, msg)
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
			if canReply(e) && !api.Healthy(e.Ctx) {
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

// canReply reports whether the interaction can be answered with a message.
func canReply(e *handler.InteractionEvent) bool {
	t := e.Type()
	return t == discord.InteractionTypeApplicationCommand || t == discord.InteractionTypeComponent
}

func typeName(t discord.InteractionType) string {
	switch t {
	case discord.InteractionTypeApplicationCommand:
		return "command"
	case discord.InteractionTypeComponent:
		return "component"
	case discord.InteractionTypeAutocomplete:
		return "autocomplete"
	case discord.InteractionTypeModalSubmit:
		return "modal"
	}
	return fmt.Sprint(int(t))
}
