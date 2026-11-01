// Package points ports the /moderation points give and source subcommands
// (src/commands/moderation/points.ts and src/points/awardPoints.ts).
package points

import (
	"context"
	"fmt"
	"strings"

	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/handler"
	"github.com/disgoorg/snowflake/v2"

	"github.com/Miconen/tectonic-bot/go/internal/deps"
	"github.com/Miconen/tectonic-bot/go/internal/mw"
	"github.com/Miconen/tectonic-bot/go/internal/ranks"
	"github.com/Miconen/tectonic-bot/go/internal/reply"
	"github.com/Miconen/tectonic-bot/go/internal/str"
	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
)

var Command = discord.SlashCommandCreate{
	Name:        "moderation",
	Description: "Moderation commands",
	Options: []discord.ApplicationCommandOption{
		discord.ApplicationCommandOptionSubCommandGroup{
			Name:        "points",
			Description: "Manage user points",
			Options: []discord.ApplicationCommandOptionSubCommand{
				{
					Name:        "give",
					Description: "Give points to a user",
					Options: []discord.ApplicationCommandOption{
						discord.ApplicationCommandOptionUser{Name: "username", Description: "@User tag to give points to", Required: true},
						discord.ApplicationCommandOptionFloat{Name: "amount", Description: "Amount of points to give", Required: true},
					},
				},
				{
					Name:        "source",
					Description: "Give points to a user by a point source",
					Options: []discord.ApplicationCommandOption{
						discord.ApplicationCommandOptionUser{Name: "username", Description: "@User tag to give points to", Required: true},
						discord.ApplicationCommandOptionString{Name: "source", Description: "Point source to give", Required: true, Autocomplete: true},
					},
				},
			},
		},
	},
}

func Register(r handler.Router, d deps.Deps) {
	r.Route("/moderation", func(r handler.Router) {
		r.Use(mw.RequireAdmin) // @Guard(IsAdmin)

		r.Route("/points", func(r handler.Router) {
			r.SlashCommand("/give", func(data discord.SlashCommandInteractionData, e *handler.CommandEvent) error {
				return give(d, e, data, tectonic.CustomPoints(data.Float("amount")), str.GuildArgs{})
			})
			r.SlashCommand("/source", func(data discord.SlashCommandInteractionData, e *handler.CommandEvent) error {
				src := data.String("source")
				return give(d, e, data, tectonic.PresetPoints(src), str.GuildArgs{PointSource: src})
			})
			r.Autocomplete("/source", func(e *handler.AutocompleteEvent) error {
				choices, err := d.Sources.Choices(e.Ctx, e.GuildID().String(), e.Data.Focused().String())
				if err != nil {
					return err
				}
				return e.AutocompleteResult(choices)
			})
		})
	})
}

func give(d deps.Deps, e *handler.CommandEvent, data discord.SlashCommandInteractionData, p tectonic.Points, args str.GuildArgs) error {
	if err := reply.Defer(e.Ctx, e, false); err != nil {
		return err
	}

	user := data.User("username")
	member, _ := data.OptMember("username")
	member.User = user // resolved members don't carry their user

	msg, err := Award(e.Ctx, d, e.Client().Rest, *e.GuildID(), []discord.Member{member.Member}, p)
	if err != nil {
		return reply.WithOverrides(err, str.GuildErrors(args))
	}
	return reply.Text(e.Ctx, e, msg)
}

// Award gives points to members, updates rank roles and returns the summary
// message (awardPoints in TS).
func Award(ctx context.Context, d deps.Deps, roles ranks.RoleEditor, guildID snowflake.ID, members []discord.Member, p tectonic.Points) (string, error) {
	byID := make(map[string]discord.Member, len(members))
	ids := make([]string, 0, len(members))
	for _, m := range members {
		id := m.User.ID.String()
		byID[id] = m
		ids = append(ids, id)
	}

	res, err := d.API.GivePoints(ctx, guildID.String(), ids, p)
	if err != nil {
		return "", err
	}

	rankList := d.Ranks.Get(ctx, guildID.String())

	lines := make([]string, 0, len(res))
	for _, entry := range res {
		m, ok := byID[entry.UserID]
		if !ok {
			lines = append(lines, str.CouldntGetUser(entry.UserID))
			continue
		}

		oldPoints := entry.Points - entry.GivenPoints
		t, err := ranks.ApplyTransition(ctx, roles, guildID, ranks.Member{ID: m.User.ID, RoleIDs: m.RoleIDs}, rankList, oldPoints, entry.Points)
		if err != nil {
			return "", fmt.Errorf("sync rank roles for %s: %w", m.User.ID, err)
		}
		lines = append(lines, FormatAward(m.EffectiveName(), entry.GivenPoints, entry.Points, t))
	}
	return strings.Join(lines, "\n"), nil
}

// FormatAward is formatPointsAward in TS.
func FormatAward(displayName string, given, total int, t ranks.Transition) string {
	newIcon := ranks.Icon(t.New)
	if t.New == nil || t.New.Icon == nil {
		newIcon = ranks.Icon(t.Old)
	}

	out := str.PointsGranted(displayName, given, total-given, ranks.Icon(t.Old), total, newIcon)
	if t.Changed && t.New != nil {
		name := str.DisplayName(t.New.Name)
		if given >= 0 {
			out += "\n" + str.RankUp(ranks.Icon(t.New), name)
		} else {
			out += "\n" + str.RankDown(ranks.Icon(t.New), name)
		}
	}
	return out
}
