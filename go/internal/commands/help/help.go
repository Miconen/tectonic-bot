// Package help ports /help: links to the docs and lists this server's point
// values and rank tiers.
package help

import (
	"strings"

	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/handler"

	"github.com/Miconen/tectonic-bot/go/internal/deps"
	. "github.com/Miconen/tectonic-bot/go/internal/opt"
	"github.com/Miconen/tectonic-bot/go/internal/ranks"
	"github.com/Miconen/tectonic-bot/go/internal/reply"
	"github.com/Miconen/tectonic-bot/go/internal/str"
)

var Command = discord.SlashCommandCreate{
	Name:        "help",
	Description: "Commands to help you use commands",
	Options: []discord.ApplicationCommandOption{
		Sub("commands", "Information about all commands"),
		Sub("ranks", "Information about all the ranks"),
		Sub("points", "Information about points"),
		Sub("split", "Information about splitting"),
	},
}

// pointSections is the /help points layout: section title, then the point
// sources shown in it with their labels.
var pointSections = []struct {
	title   string
	sources [][2]string
}{
	{"Splits", [][2]string{{"split_low", "Low value"}, {"split_medium", "Medium value"}, {"split_high", "High value"}}},
	{"Events", [][2]string{{"event_participation", "Participation"}, {"event_hosting", "Hosting"}}},
	{"Learners", [][2]string{{"learner_half", "Half"}, {"learner_full", "Full"}}},
	{"Forum", [][2]string{{"forum_bump", "Bumping"}}},
}

func Register(r handler.Router, d deps.Deps) {
	h := &help{d: d}
	r.Route("/help", func(r handler.Router) {
		r.SlashCommand("/commands", func(_ discord.SlashCommandInteractionData, e *handler.CommandEvent) error {
			return e.CreateMessage(discord.MessageCreate{Content: str.HelpCommands})
		})
		r.SlashCommand("/ranks", h.ranks)
		r.SlashCommand("/points", h.points)
		r.SlashCommand("/split", h.split)
	})
}

type help struct{ d deps.Deps }

func (h *help) ranks(_ discord.SlashCommandInteractionData, e *handler.CommandEvent) error {
	ctx := e.Ctx
	if err := reply.Defer(ctx, e, false); err != nil {
		return err
	}
	list := h.d.Ranks.Get(ctx, e.GuildID().String())
	if len(list) == 0 {
		return reply.Text(ctx, e, str.NoRankTiers)
	}
	lines := []string{str.HelpRanksHeader}
	for _, r := range list {
		lines = append(lines, str.HelpRank(ranks.Icon(&r), r.Name, r.MinPoints))
	}
	return reply.Text(ctx, e, strings.Join(lines, "\n"))
}

// points shows each source with the server multiplier applied. Sources the
// server doesn't have are left out instead of showing "undefined" as TS did.
func (h *help) points(_ discord.SlashCommandInteractionData, e *handler.CommandEvent) error {
	ctx := e.Ctx
	if err := reply.Defer(ctx, e, false); err != nil {
		return err
	}
	resolve, err := h.resolver(e)
	if err != nil {
		return err
	}
	lines := []string{str.HelpPointsHeader}
	for _, sec := range pointSections {
		var entries []string
		for _, src := range sec.sources {
			if p, ok := resolve(src[0]); ok {
				entries = append(entries, str.HelpPointValue(src[1], p))
			}
		}
		if len(entries) > 0 {
			lines = append(lines, str.HelpSection(sec.title))
			lines = append(lines, entries...)
		}
	}
	return reply.Text(ctx, e, strings.Join(lines, "\n"))
}

func (h *help) split(_ discord.SlashCommandInteractionData, e *handler.CommandEvent) error {
	ctx := e.Ctx
	if err := reply.Defer(ctx, e, false); err != nil {
		return err
	}
	resolve, err := h.resolver(e)
	if err != nil {
		return err
	}
	pts := func(s string) int { p, _ := resolve(s); return p }
	return reply.Text(ctx, e, str.HelpSplit(pts("split_low"), pts("split_medium"), pts("split_high")))
}

// resolver returns a lookup for point values with the guild multiplier.
func (h *help) resolver(e *handler.CommandEvent) (func(source string) (int, bool), error) {
	guild, err := h.d.API.GetGuild(e.Ctx, e.GuildID().String())
	if err != nil {
		return nil, reply.WithOverrides(err, str.GuildErrors(str.GuildArgs{}))
	}
	return func(source string) (int, bool) {
		r, err := h.d.Sources.Resolve(e.Ctx, guild, source)
		return r.Points, err == nil
	}, nil
}
