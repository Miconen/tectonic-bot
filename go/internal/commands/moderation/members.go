package moderation

import (
	"github.com/disgoorg/disgo/discord"

	"github.com/Miconen/tectonic-bot/go/internal/ranks"
	"github.com/Miconen/tectonic-bot/go/internal/reply"
	"github.com/Miconen/tectonic-bot/go/internal/str"
)

// target is the member picked in the "username" option. Users who aren't in
// the server can't be managed, so they get a clear message instead of a
// confusing API error later.
func target(data cmdData) (discord.Member, error) {
	m, ok := data.OptMember("username")
	if !ok {
		return discord.Member{}, reply.UserError(str.NotInServer)
	}
	m.User = data.User("username") // resolved members don't carry their user
	return m.Member, nil
}

func rankMember(m discord.Member) ranks.Member {
	return ranks.Member{ID: m.User.ID, RoleIDs: m.RoleIDs}
}

func mention(m discord.Member) string { return "<@" + m.User.ID.String() + ">" }
