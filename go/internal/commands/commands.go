// Package commands lists every slash command and registers its routes.
// Adding a command means adding a line to Definitions and to Register.
package commands

import (
	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/handler"

	"github.com/Miconen/tectonic-bot/go/internal/approval"
	"github.com/Miconen/tectonic-bot/go/internal/commands/pb"
	"github.com/Miconen/tectonic-bot/go/internal/commands/points"
	"github.com/Miconen/tectonic-bot/go/internal/commands/profile"
	"github.com/Miconen/tectonic-bot/go/internal/deps"
	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
)

// Definitions is what gets synced to Discord. Some commands list bosses as
// choices, so it needs the boss list.
func Definitions(bosses []tectonic.Boss) []discord.ApplicationCommandCreate {
	defs := []discord.ApplicationCommandCreate{
		profile.Command,
		points.Command,
		pb.Command(bosses),
	}
	return append(defs, approval.Commands...)
}

// Register adds every command's handlers to the router.
func Register(r handler.Router, d deps.Deps, bosses []tectonic.Boss) {
	approvals := approval.New()

	profile.Register(r, d)
	points.Register(r, d)
	pb.Register(r, d, pb.NewBosses(bosses), approvals)
	approvals.Register(r)
}
