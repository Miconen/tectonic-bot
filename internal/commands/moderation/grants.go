package moderation

import (
	"context"
	"fmt"

	"github.com/disgoorg/disgo/handler"

	"github.com/Miconen/tectonic-bot/internal/catalog"
	"github.com/Miconen/tectonic-bot/internal/reply"
	"github.com/Miconen/tectonic-bot/internal/str"
	"github.com/Miconen/tectonic-bot/internal/tectonic"
)

// grantAction is one of the four grant/remove subcommands. They only differ
// in the API call and the strings, so they share one handler.
type grantAction struct {
	call   func(ctx context.Context, guildID, userID, name string) error
	errors func(username, name string) str.Overrides
	done   func(name, username string) string
}

func (m *mod) runGrant(a grantAction) handler.SlashCommandHandler {
	return func(data cmdData, e *cmdEvent) error {
		ctx := e.Ctx
		member, err := target(data)
		if err != nil {
			return err
		}
		name := data.String("achievement")
		if err := reply.Defer(ctx, e, false); err != nil {
			return err
		}
		guildID, userID, username := e.GuildID().String(), member.User.ID.String(), member.EffectiveName()
		if err := a.call(ctx, guildID, userID, name); err != nil {
			return reply.WithOverrides(err, a.errors(username, name))
		}
		m.d.Catalog.UserChanged(guildID, userID)
		return reply.Text(ctx, e, a.done(name, username))
	}
}

// giveAchievement and removeAchievement adapt the achievement calls (which
// take a UserQuery) to grantAction's shape.
func (m *mod) giveAchievement(ctx context.Context, guildID, userID, name string) error {
	return m.d.API.GiveAchievement(ctx, guildID, tectonic.ByUserID(userID), name)
}

func (m *mod) removeAchievement(ctx context.Context, guildID, userID, name string) error {
	return m.d.API.RemoveAchievement(ctx, guildID, tectonic.ByUserID(userID), name)
}

func caErrors(_, name string) str.Overrides { return str.CombatAchievementErrors(name) }

// achievementAutocomplete lists achievements the picked member has (owned) or
// doesn't have yet (!owned).
func (m *mod) achievementAutocomplete(owned bool) handler.AutocompleteHandler {
	return func(e *handler.AutocompleteEvent) error {
		u, err := m.pickedUser(e)
		if err != nil {
			return err
		}
		var list []tectonic.Achievement
		for _, a := range m.d.Catalog.Achievements {
			if catalog.HasAchievement(u, a.Name) == owned {
				list = append(list, a)
			}
		}
		name := func(a tectonic.Achievement) string { return a.Name }
		return e.AutocompleteResult(catalog.Choices(list, e.Data.Focused().String(), name, name))
	}
}

// caAutocomplete lists the guild's combat achievements the picked member has
// (owned) or hasn't completed yet (!owned).
func (m *mod) caAutocomplete(owned bool) handler.AutocompleteHandler {
	return func(e *handler.AutocompleteEvent) error {
		cas, err := m.d.Catalog.CombatAchievements(e.Ctx, e.GuildID().String())
		if err != nil {
			return err
		}
		u, err := m.pickedUser(e)
		if err != nil {
			return err
		}
		var list []tectonic.CombatAchievement
		for _, ca := range cas {
			if catalog.HasCombatAchievement(u, ca.Name) == owned {
				list = append(list, ca)
			}
		}
		return e.AutocompleteResult(catalog.Choices(list, e.Data.Focused().String(),
			func(ca tectonic.CombatAchievement) string { return fmt.Sprintf("%s | %d points", ca.Name, ca.Points) },
			func(ca tectonic.CombatAchievement) string { return ca.Name }))
	}
}
