package moderation

import (
	"context"

	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/handler"

	"github.com/Miconen/tectonic-bot/internal/award"
	"github.com/Miconen/tectonic-bot/internal/members"
	"github.com/Miconen/tectonic-bot/internal/reply"
	"github.com/Miconen/tectonic-bot/internal/str"
	"github.com/Miconen/tectonic-bot/internal/team"
	"github.com/Miconen/tectonic-bot/internal/tectonic"
)

func (m *mod) pointsGive(data cmdData, e *cmdEvent) error {
	return m.giveOne(e, data, tectonic.CustomPoints(data.Int("amount")), "")
}

func (m *mod) pointsSource(data cmdData, e *cmdEvent) error {
	return m.giveOne(e, data, tectonic.PresetPoints(data.String("source")), data.String("source"))
}

func (m *mod) pointsRole(data cmdData, e *cmdEvent) error {
	return m.giveRole(e, data.Role("role"), tectonic.PresetPoints(data.String("source")), data.String("source"))
}

func (m *mod) pointsRoleByPoints(data cmdData, e *cmdEvent) error {
	return m.giveRole(e, data.Role("role"), tectonic.CustomPoints(data.Int("amount")), "")
}

func (m *mod) giveOne(e *cmdEvent, data cmdData, p tectonic.Points, source string) error {
	member, err := target(data)
	if err != nil {
		return err
	}
	if err := reply.Defer(e.Ctx, e, false); err != nil {
		return err
	}
	// The API answers "point source not found" when nobody was updated, so
	// check activation first for a message that makes sense.
	player := team.Player{ID: member.User.ID.String(), Name: member.EffectiveName()}
	if err := team.RequireActivated(e.Ctx, m.d.API, e.GuildID().String(), []team.Player{player}); err != nil {
		return err
	}
	return m.give(e.Ctx, e, []discord.Member{member}, p, source)
}

// giveRole awards everyone in a role. Only activated members are sent to the
// API; the TS bot sent every member and failed if none were activated.
func (m *mod) giveRole(e *cmdEvent, role discord.Role, p tectonic.Points, source string) error {
	ctx := e.Ctx
	if err := reply.Defer(ctx, e, false); err != nil {
		return err
	}
	all, err := members.WithRole(ctx, e.Client().Rest, *e.GuildID(), role.ID)
	if err != nil {
		return err
	}
	ids := make([]string, len(all))
	for i, mem := range all {
		ids[i] = mem.User.ID.String()
	}
	active, err := team.Activated(ctx, m.d.API, e.GuildID().String(), ids)
	if err != nil {
		return err
	}
	var eligible []discord.Member
	for _, mem := range all {
		if active[mem.User.ID.String()] {
			eligible = append(eligible, mem)
		}
	}
	if len(eligible) == 0 {
		return reply.UserError(str.NoRoleMembers(role.Name))
	}
	return m.give(ctx, e, eligible, p, source)
}

func (m *mod) give(ctx context.Context, e *cmdEvent, ms []discord.Member, p tectonic.Points, source string) error {
	msg, err := award.Give(ctx, m.d, e.Client().Rest, *e.GuildID(), ms, p)
	if err != nil {
		return reply.WithOverrides(err, str.GuildErrors(str.GuildArgs{PointSource: source}))
	}
	return reply.Text(ctx, e, msg)
}

func (m *mod) sourceAutocomplete(e *handler.AutocompleteEvent) error {
	choices, err := m.d.Sources.Choices(e.Ctx, e.GuildID().String(), e.Data.Focused().String())
	if err != nil {
		return err
	}
	return e.AutocompleteResult(choices)
}
