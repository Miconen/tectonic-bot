package moderation

import (
	"strings"

	"github.com/disgoorg/disgo/handler"

	"github.com/Miconen/tectonic-bot/go/internal/catalog"
	"github.com/Miconen/tectonic-bot/go/internal/logging"
	"github.com/Miconen/tectonic-bot/go/internal/ranks"
	"github.com/Miconen/tectonic-bot/go/internal/reply"
	"github.com/Miconen/tectonic-bot/go/internal/str"
	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
	"github.com/Miconen/tectonic-bot/go/internal/userdump"
)

func (m *mod) activate(data cmdData, e *cmdEvent) error {
	ctx := e.Ctx
	member, err := target(data)
	if err != nil {
		return err
	}
	rsn := strings.TrimSpace(data.String("rsn"))
	if err := reply.Defer(ctx, e, false); err != nil {
		return err
	}

	guildID := e.GuildID().String()
	if err := m.d.API.CreateUser(ctx, guildID, member.User.ID.String(), rsn); err != nil {
		return reply.WithOverrides(err, str.AccountErrors(str.AccountArgs{Username: member.EffectiveName(), RSN: rsn}))
	}
	m.d.Catalog.UserChanged(guildID, member.User.ID.String())

	msg := str.Activated(mention(member), mention(e.Member().Member))
	// The account exists now, so a role failure is a warning, not an error.
	tier := ranks.TierFor(0, m.d.Ranks.Get(ctx, guildID))
	if err := ranks.SyncRoles(ctx, e.Client().Rest, *e.GuildID(), rankMember(member), m.d.Ranks.Get(ctx, guildID), tier); err != nil {
		logging.Logger(ctx).Warn("Failed to add default rank role", "err", err)
		msg += "\n" + str.RoleWarning(err)
	}
	return reply.Text(ctx, e, msg)
}

func (m *mod) deactivate(data cmdData, e *cmdEvent) error {
	ctx := e.Ctx
	member, err := target(data)
	if err != nil {
		return err
	}
	if err := reply.Defer(ctx, e, false); err != nil {
		return err
	}

	guildID, userID := e.GuildID().String(), member.User.ID.String()
	name := member.EffectiveName()
	u, err := m.d.API.GetUser(ctx, guildID, tectonic.ByUserID(userID))
	if err != nil {
		return reply.WithOverrides(err, str.AccountErrors(str.AccountArgs{Username: name}))
	}
	if u == nil {
		return reply.UserError(str.NotActivated(name))
	}

	// Keep a copy of their data before it's gone.
	if err := userdump.Post(ctx, e.Client().Rest, m.d.API, *e.GuildID(), u, userdump.ReasonDeactivated); err != nil {
		logging.Logger(ctx).Warn("Failed to dump deactivated user's data", "err", err)
	}
	if err := m.d.API.RemoveUser(ctx, guildID, tectonic.ByUserID(userID)); err != nil {
		return reply.WithOverrides(err, str.AccountErrors(str.AccountArgs{Username: name}))
	}
	m.d.Catalog.UserChanged(guildID, userID)

	msg := str.Deactivated(name)
	if err := ranks.SyncRoles(ctx, e.Client().Rest, *e.GuildID(), rankMember(member), m.d.Ranks.Get(ctx, guildID), nil); err != nil {
		logging.Logger(ctx).Warn("Failed to remove rank roles", "err", err)
		msg += "\n" + str.RoleWarning(err)
	}
	return reply.Text(ctx, e, msg)
}

func (m *mod) rsnAdd(data cmdData, e *cmdEvent) error {
	ctx := e.Ctx
	member, err := target(data)
	if err != nil {
		return err
	}
	rsn := strings.TrimSpace(data.String("rsn"))
	if err := reply.Defer(ctx, e, false); err != nil {
		return err
	}

	guildID, userID, name := e.GuildID().String(), member.User.ID.String(), member.EffectiveName()
	if err := m.d.API.AddRSN(ctx, guildID, userID, rsn); err != nil {
		return reply.WithOverrides(err, str.AccountErrors(str.AccountArgs{Username: name, RSN: rsn}))
	}
	m.d.Catalog.UserChanged(guildID, userID)

	lines := []string{str.RSNListHeader(name), str.RSNAdded(rsn, name)}
	// The RSN is saved; the list is a nicety, so a failed lookup isn't an error.
	if u, err := m.d.API.GetUser(ctx, guildID, tectonic.ByUserID(userID)); err == nil && u != nil {
		for _, r := range u.RSNs {
			lines = append(lines, "`"+r.RSN+"`")
		}
	}
	return reply.Text(ctx, e, strings.Join(lines, "\n"))
}

func (m *mod) rsnRemove(data cmdData, e *cmdEvent) error {
	ctx := e.Ctx
	member, err := target(data)
	if err != nil {
		return err
	}
	rsn := data.String("rsn")
	if err := reply.Defer(ctx, e, false); err != nil {
		return err
	}

	guildID, userID, name := e.GuildID().String(), member.User.ID.String(), member.EffectiveName()
	if err := m.d.API.RemoveRSN(ctx, guildID, userID, rsn); err != nil {
		return reply.WithOverrides(err, str.AccountErrors(str.AccountArgs{Username: name, RSN: rsn}))
	}
	m.d.Catalog.UserChanged(guildID, userID)
	return reply.Text(ctx, e, str.RSNRemoved(rsn, name))
}

// rsnAutocomplete lists the picked member's linked RSNs (the TS bot made you
// type it from memory).
func (m *mod) rsnAutocomplete(e *handler.AutocompleteEvent) error {
	u, err := m.pickedUser(e)
	if err != nil || u == nil {
		return e.AutocompleteResult(nil)
	}
	rsn := func(r tectonic.RSN) string { return r.RSN }
	return e.AutocompleteResult(catalog.Choices(u.RSNs, e.Data.Focused().String(), rsn, rsn))
}

// pickedUser is the user already chosen in the "username" option while
// another option is being autocompleted (nil if none yet or not activated).
func (m *mod) pickedUser(e *handler.AutocompleteEvent) (*tectonic.DetailedUser, error) {
	id, ok := e.Data.OptSnowflake("username")
	if !ok {
		return nil, nil
	}
	return m.d.Catalog.User(e.Ctx, e.GuildID().String(), id.String())
}
