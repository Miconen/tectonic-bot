package moderation

import (
	"strconv"

	"github.com/Miconen/tectonic-bot/go/internal/reply"
	"github.com/Miconen/tectonic-bot/go/internal/str"
	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
)

func (m *mod) start(_ cmdData, e *cmdEvent) error {
	if err := reply.Defer(e.Ctx, e, false); err != nil {
		return err
	}
	if err := m.d.API.CreateGuild(e.Ctx, e.GuildID().String()); err != nil {
		return reply.WithOverrides(err, str.GuildErrors(str.GuildArgs{}))
	}
	return reply.Text(e.Ctx, e, str.GuildInitialized)
}

// setting describes one guild setting: how to show its current value and how
// to build the update for a new one.
type setting struct {
	field  string
	show   func(tectonic.Guild) string
	update tectonic.GuildUpdate
	to     string
}

// updateSetting reads the current value first so the reply shows a real
// From -> To (#145).
func (m *mod) updateSetting(e *cmdEvent, s setting) error {
	ctx := e.Ctx
	if err := reply.Defer(ctx, e, false); err != nil {
		return err
	}
	guildID := e.GuildID().String()
	guild, err := m.d.API.GetGuild(ctx, guildID)
	if err != nil {
		return reply.WithOverrides(err, str.GuildErrors(str.GuildArgs{}))
	}
	if err := m.d.API.UpdateGuild(ctx, guildID, s.update); err != nil {
		return reply.WithOverrides(err, str.GuildErrors(str.GuildArgs{}))
	}
	return reply.Text(ctx, e, str.Updated("Settings", str.Change{Field: s.field, From: s.show(guild), To: s.to}))
}

func (m *mod) setModChannel(data cmdData, e *cmdEvent) error {
	id := data.Channel("channel").ID.String()
	return m.updateSetting(e, setting{
		field:  "Moderation channel",
		show:   func(g tectonic.Guild) string { return str.ChannelMention(g.ModChannelID) },
		update: tectonic.GuildUpdate{ModChannelID: &id},
		to:     str.ChannelMention(&id),
	})
}

func (m *mod) setLogChannel(data cmdData, e *cmdEvent) error {
	id := data.Channel("channel").ID.String()
	return m.updateSetting(e, setting{
		field:  "Log channel",
		show:   func(g tectonic.Guild) string { return str.ChannelMention(g.LogChannelID) },
		update: tectonic.GuildUpdate{LogChannelID: &id},
		to:     str.ChannelMention(&id),
	})
}

func (m *mod) setMultiplier(data cmdData, e *cmdEvent) error {
	n := data.Int("multiplier")
	return m.updateSetting(e, setting{
		field:  "Point multiplier",
		show:   func(g tectonic.Guild) string { return "x" + strconv.Itoa(g.Multiplier) },
		update: tectonic.GuildUpdate{Multiplier: &n},
		to:     "x" + strconv.Itoa(n),
	})
}

func (m *mod) setPositionCount(data cmdData, e *cmdEvent) error {
	n := data.Int("count")
	return m.updateSetting(e, setting{
		field:  "Tracked positions per boss",
		show:   func(g tectonic.Guild) string { return str.Positions(g.PositionCount) },
		update: tectonic.GuildUpdate{PositionCount: &n},
		to:     str.Positions(n),
	})
}
