package moderation

import (
	"strconv"
	"strings"

	"github.com/disgoorg/disgo/handler"

	"github.com/Miconen/tectonic-bot/internal/catalog"
	"github.com/Miconen/tectonic-bot/internal/reply"
	"github.com/Miconen/tectonic-bot/internal/str"
	"github.com/Miconen/tectonic-bot/internal/tectonic"
)

func icon(p *string) string {
	if p == nil {
		return ""
	}
	return *p
}

func (m *mod) ranksList(_ cmdData, e *cmdEvent) error {
	ctx := e.Ctx
	if err := reply.Defer(ctx, e, true); err != nil {
		return err
	}
	list, err := m.d.API.GetGuildRanks(ctx, e.GuildID().String())
	if err != nil {
		return reply.WithOverrides(err, str.GuildErrors(str.GuildArgs{}))
	}
	if len(list) == 0 {
		return reply.Ephemeral(ctx, e, str.NoRankTiers)
	}
	lines := []string{str.RankTiersHeader}
	for _, r := range list {
		lines = append(lines, str.RankTierLine(icon(r.Icon), r.Name, r.MinPoints, r.RoleID))
	}
	return reply.Ephemeral(ctx, e, strings.Join(lines, "\n"))
}

// rankFields reads the optional rank options. set lists what was given, for
// "nothing to update" checks.
func rankFields(data cmdData) (f tectonic.RankFields, set bool) {
	if v, ok := data.OptInt("min_points"); ok {
		f.MinPoints, set = &v, true
	}
	if v, ok := data.OptInt("display_order"); ok {
		f.DisplayOrder, set = &v, true
	}
	if v, ok := data.OptString("icon"); ok {
		f.Icon, set = &v, true
	}
	if r, ok := data.OptRole("role"); ok {
		id := r.ID.String()
		f.RoleID, set = &id, true
	}
	return f, set
}

func (m *mod) rankCreate(data cmdData, e *cmdEvent) error {
	ctx := e.Ctx
	name := strings.TrimSpace(data.String("name"))
	f, _ := rankFields(data)
	if err := reply.Defer(ctx, e, false); err != nil {
		return err
	}
	guildID := e.GuildID().String()
	if err := m.d.API.CreateGuildRank(ctx, guildID, name, f); err != nil {
		return reply.WithOverrides(err, str.RankErrors(name))
	}
	m.d.Ranks.Invalidate(guildID)
	return reply.Text(ctx, e, str.RankCreated(name, *f.MinPoints))
}

func (m *mod) rankUpdate(data cmdData, e *cmdEvent) error {
	ctx := e.Ctx
	name := data.String("name")
	f, set := rankFields(data)
	if !set {
		return reply.UserError(str.NothingToUpdate)
	}
	if err := reply.Defer(ctx, e, false); err != nil {
		return err
	}

	guildID := e.GuildID().String()
	old, err := m.findRank(e, name)
	if err != nil {
		return err
	}
	if err := m.d.API.UpdateGuildRank(ctx, guildID, name, f); err != nil {
		return reply.WithOverrides(err, str.RankErrors(name))
	}
	m.d.Ranks.Invalidate(guildID)

	var changes []str.Change
	if f.MinPoints != nil {
		changes = append(changes, str.Change{Field: "Minimum points", From: strconv.Itoa(old.MinPoints), To: strconv.Itoa(*f.MinPoints)})
	}
	if f.DisplayOrder != nil {
		changes = append(changes, str.Change{Field: "Display order", From: strconv.Itoa(old.DisplayOrder), To: strconv.Itoa(*f.DisplayOrder)})
	}
	if f.Icon != nil {
		changes = append(changes, str.Change{Field: "Icon", From: orNotSet(icon(old.Icon)), To: *f.Icon})
	}
	if f.RoleID != nil {
		changes = append(changes, str.Change{Field: "Role", From: str.RoleMention(old.RoleID), To: str.RoleMention(f.RoleID)})
	}
	return reply.Text(ctx, e, str.Updated("Rank **"+str.DisplayName(name)+"**", changes...))
}

func (m *mod) rankDelete(data cmdData, e *cmdEvent) error {
	ctx := e.Ctx
	name := data.String("name")
	if err := reply.Defer(ctx, e, false); err != nil {
		return err
	}
	guildID := e.GuildID().String()
	if err := m.d.API.DeleteGuildRank(ctx, guildID, name); err != nil {
		return reply.WithOverrides(err, str.RankErrors(name))
	}
	m.d.Ranks.Invalidate(guildID)
	return reply.Text(ctx, e, str.RankDeleted(name))
}

func (m *mod) findRank(e *cmdEvent, name string) (tectonic.GuildRank, error) {
	list, err := m.d.API.GetGuildRanks(e.Ctx, e.GuildID().String())
	if err != nil {
		return tectonic.GuildRank{}, reply.WithOverrides(err, str.RankErrors(name))
	}
	for _, r := range list {
		if r.Name == name {
			return r, nil
		}
	}
	return tectonic.GuildRank{}, reply.UserError(str.RankErrors(name)[tectonic.CodeGuildRankNotFound])
}

func orNotSet(s string) string {
	if s == "" {
		return str.NotSet
	}
	return s
}

func (m *mod) rankAutocomplete(e *handler.AutocompleteEvent) error {
	list := m.d.Ranks.Get(e.Ctx, e.GuildID().String()) // cached, autocomplete fires per keystroke
	return e.AutocompleteResult(catalog.Choices(list, e.Data.Focused().String(),
		func(r tectonic.GuildRank) string { return str.RankChoice(icon(r.Icon), r.Name, r.MinPoints) },
		func(r tectonic.GuildRank) string { return r.Name }))
}
