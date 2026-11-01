// Package commands lists every slash command and registers its routes.
// Adding a command means adding one line to each list below.
package commands

import (
	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/handler"

	"github.com/Miconen/tectonic-bot/go/internal/commands/points"
	"github.com/Miconen/tectonic-bot/go/internal/commands/profile"
	"github.com/Miconen/tectonic-bot/go/internal/deps"
)

// All is what gets synced to Discord.
var All = []discord.ApplicationCommandCreate{
	profile.Command,
	points.Command,
}

// Register adds every command's handlers to the router.
func Register(r handler.Router, d deps.Deps) {
	profile.Register(r, d)
	points.Register(r, d)
}
