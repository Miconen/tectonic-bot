// Package commands lists every slash command and registers its routes.
// Adding a command means adding a line to Definitions and to Register.
package commands

import (
	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/handler"

	"github.com/Miconen/tectonic-bot/go/internal/approval"
	"github.com/Miconen/tectonic-bot/go/internal/commands/bingo"
	"github.com/Miconen/tectonic-bot/go/internal/commands/event"
	"github.com/Miconen/tectonic-bot/go/internal/commands/help"
	"github.com/Miconen/tectonic-bot/go/internal/commands/moderation"
	"github.com/Miconen/tectonic-bot/go/internal/commands/pb"
	"github.com/Miconen/tectonic-bot/go/internal/commands/profile"
	"github.com/Miconen/tectonic-bot/go/internal/commands/submissions"
	"github.com/Miconen/tectonic-bot/go/internal/deps"
	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
)

// Definitions is what gets synced to Discord. Some commands list bosses as
// choices, so it needs the boss list.
func Definitions(bosses []tectonic.Boss) []discord.ApplicationCommandCreate {
	defs := []discord.ApplicationCommandCreate{
		profile.Command,
		moderation.Command,
		event.Command,
		bingo.Command,
		help.Command,
		pb.Command(bosses),
	}
	defs = append(defs, submissions.Commands...)
	return append(defs, approval.Commands...)
}

// Register adds every command's handlers to the router.
func Register(r handler.Router, d deps.Deps, bosses []tectonic.Boss) {
	approvals := approval.New()

	profile.Register(r, d)
	moderation.Register(r, d)
	event.Register(r, d)
	bingo.Register(r, d)
	help.Register(r, d)
	pb.Register(r, d, pb.NewBosses(bosses), approvals)
	submissions.Register(r, d, approvals)
	approvals.Register(r)
}
