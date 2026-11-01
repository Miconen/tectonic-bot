// Package pb ports /pb: every boss submission command, the PB approval
// request and the leaderboard embed update.
package pb

import (
	"log/slog"
	"slices"

	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/handler"

	"github.com/Miconen/tectonic-bot/internal/approval"
	"github.com/Miconen/tectonic-bot/internal/deps"
	"github.com/Miconen/tectonic-bot/internal/opt"
	"github.com/Miconen/tectonic-bot/internal/team"
	"github.com/Miconen/tectonic-bot/internal/tectonic"
)

// Bosses indexes the API's boss list by name.
type Bosses map[string]tectonic.Boss

func NewBosses(list []tectonic.Boss) Bosses {
	b := make(Bosses, len(list))
	for _, boss := range list {
		b[boss.Name] = boss
	}
	return b
}

// Command builds /pb. Boss choices come from the API, so it needs the boss
// list (fetched once at startup, like the TS bot).
func Command(bosses []tectonic.Boss) discord.SlashCommandCreate {
	subs := make([]discord.ApplicationCommandOption, 0, len(variants))
	for _, v := range variants {
		subs = append(subs, discord.ApplicationCommandOptionSubCommand{
			Name:        v.name,
			Description: "Request your new pb to be added",
			Options:     options(v, bosses),
		})
	}
	return discord.SlashCommandCreate{
		Name:        "pb",
		Description: "Commands for handling and requesting boss times",
		Options:     subs,
	}
}

func options(v variant, bosses []tectonic.Boss) []discord.ApplicationCommandOption {
	var opts []discord.ApplicationCommandOption

	if v.category != "" {
		desc := v.choiceDesc
		if desc == "" {
			desc = "Boss to submit time for"
		}
		opts = append(opts, discord.ApplicationCommandOptionString{
			Name:        v.boss(),
			Description: desc,
			Required:    true,
			Choices:     choices(v, bosses),
		})
	}

	opts = append(opts, opt.String(v.value(), v.timeDesc))
	if v.raidLevel {
		opts = append(opts, opt.IntRange("raidlevel", "ToA raid level", 0, 600))
	}
	opts = append(opts, opt.Attachment("screenshot", "Screenshot proof of the time"))
	return append(opts, team.PlayerOptions(v.players(), v.requiredPlayers)...)
}

func choices(v variant, bosses []tectonic.Boss) []discord.ApplicationCommandOptionChoiceString {
	var out []discord.ApplicationCommandOptionChoiceString
	for _, b := range bosses {
		if b.Category != v.category || slices.Contains(v.exclude, b.Name) {
			continue
		}
		if len(out) == 25 { // Discord's limit
			slog.Warn("too many bosses for a choice list, extra ones dropped", "command", v.name, "boss", b.Name)
			continue
		}
		out = append(out, discord.ApplicationCommandOptionChoiceString{Name: b.DisplayName, Value: b.Name})
	}
	return out
}

// Register routes every /pb subcommand to the same submit handler.
func Register(r handler.Router, d deps.Deps, bosses Bosses, approvals *approval.Service) {
	s := &submitter{d: d, bosses: bosses, approvals: approvals}
	r.Route("/pb", func(r handler.Router) {
		for _, v := range variants {
			r.SlashCommand("/"+v.name, func(data discord.SlashCommandInteractionData, e *handler.CommandEvent) error {
				return s.submit(v, data, e)
			})
		}
	})
}
