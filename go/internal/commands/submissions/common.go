// Package submissions ports the member-submitted requests that moderators
// approve: /split, /ca and /achievement.
package submissions

import (
	"context"

	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/handler"

	"github.com/Miconen/tectonic-bot/go/internal/approval"
	"github.com/Miconen/tectonic-bot/go/internal/deps"
	"github.com/Miconen/tectonic-bot/go/internal/members"
	"github.com/Miconen/tectonic-bot/go/internal/opt"
	"github.com/Miconen/tectonic-bot/go/internal/reply"
	"github.com/Miconen/tectonic-bot/go/internal/str"
	"github.com/Miconen/tectonic-bot/go/internal/team"
	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
)

// Commands are the slash command definitions to sync.
var Commands = []discord.ApplicationCommandCreate{splitCommand, caCommand, achievementCommand}

// Register adds /split, /ca and /achievement.
func Register(r handler.Router, d deps.Deps, approvals *approval.Service) {
	s := &service{d: d, approvals: approvals}
	r.SlashCommand("/split", s.split)
	r.SlashCommand("/ca", s.ca)
	r.Autocomplete("/ca", s.caAutocomplete)
	r.SlashCommand("/achievement", s.achievement)
	r.Autocomplete("/achievement", s.achievementAutocomplete)
}

type service struct {
	d         deps.Deps
	approvals *approval.Service
}

// begin defers, checks every player is activated and loads the guild config
// (needed for the mod channel and multiplier). Every submission starts here.
func (s *service) begin(ctx context.Context, e *handler.CommandEvent, players []team.Player) (tectonic.Guild, error) {
	if err := reply.Defer(ctx, e, false); err != nil {
		return tectonic.Guild{}, err
	}
	guildID := e.GuildID().String()
	if err := team.RequireActivated(ctx, s.d.API, guildID, players); err != nil {
		return tectonic.Guild{}, err
	}
	guild, err := s.d.API.GetGuild(ctx, guildID)
	if err != nil {
		return tectonic.Guild{}, reply.WithOverrides(err, str.GuildErrors(str.GuildArgs{}))
	}
	return guild, nil
}

// invoker is the submitting member as a team player.
func invoker(e *handler.CommandEvent) team.Player {
	m := e.Member()
	return team.Player{ID: m.User.ID.String(), Name: m.EffectiveName()}
}

// membersInOrder fetches members for ids, keeping ids' order and skipping
// anyone who has left.
func membersInOrder(ctx context.Context, env approval.Env, ids []string) ([]discord.Member, error) {
	found, err := members.Fetch(ctx, env.Client.Rest, env.GuildID, ids)
	if err != nil {
		return nil, err
	}
	out := make([]discord.Member, 0, len(found))
	for _, id := range ids {
		if m, ok := found[id]; ok {
			out = append(out, m)
		}
	}
	return out, nil
}

func screenshotOption(desc string) opt.Option { return opt.Attachment("screenshot", desc) }
