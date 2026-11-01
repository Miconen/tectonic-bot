// Package bingo ports /bingo setup: a role, text and voice channels for every
// team of a Wise Old Man team competition.
package bingo

import (
	"context"
	"errors"
	"fmt"
	"math/rand/v2"
	"slices"
	"strings"

	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/handler"
	"github.com/disgoorg/disgo/rest"
	"github.com/disgoorg/snowflake/v2"

	"github.com/Miconen/tectonic-bot/go/internal/deps"
	"github.com/Miconen/tectonic-bot/go/internal/logging"
	"github.com/Miconen/tectonic-bot/go/internal/mw"
	. "github.com/Miconen/tectonic-bot/go/internal/opt"
	"github.com/Miconen/tectonic-bot/go/internal/reply"
	"github.com/Miconen/tectonic-bot/go/internal/str"
	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
	"github.com/Miconen/tectonic-bot/go/internal/wom"
)

var Command = discord.SlashCommandCreate{
	Name:        "bingo",
	Description: "Guild bingo tools",
	Options: []discord.ApplicationCommandOption{
		Sub("setup", "Set up team channels and roles from a WOM team competition",
			IntRange("competition", "WOM competition ID", 1, -1),
			Optional(IntRange("text-channels", "Number of text channels per team (default 1)", 1, 3)),
			Optional(IntRange("voice-channels", "Number of voice channels per team (default 1)", 1, 3))),
	},
}

func Register(r handler.Router, d deps.Deps) {
	b := &bingo{d: d}
	r.Route("/bingo", func(r handler.Router) {
		r.Use(mw.RequireAdmin)
		r.SlashCommand("/setup", b.setup)
	})
}

type bingo struct{ d deps.Deps }

func (b *bingo) setup(data discord.SlashCommandInteractionData, e *handler.CommandEvent) error {
	ctx := e.Ctx
	id := data.Int("competition")
	texts, voices := optInt(data, "text-channels", 1), optInt(data, "voice-channels", 1)
	if err := reply.Defer(ctx, e, false); err != nil {
		return err
	}

	comp, err := b.d.Wom.Competition(ctx, id)
	if errors.Is(err, wom.ErrNotFound) {
		return reply.UserError(str.CompetitionNotFound(id))
	}
	if err != nil {
		return err
	}
	if len(comp.TeamNames) == 0 {
		return reply.UserError(str.NotTeamEvent)
	}

	guildID := *e.GuildID()
	// One lookup for every RSN; TS made one API call per player.
	owners, err := b.rsnOwners(ctx, guildID.String(), comp)
	if err != nil {
		return err
	}

	r := e.Client().Rest
	category, err := r.CreateGuildChannel(guildID, discord.GuildCategoryChannelCreate{Name: comp.Title}, rest.WithCtx(ctx))
	if err != nil {
		return fmt.Errorf("create category: %w", err)
	}

	lines := []string{str.BingoSetupComplete(comp.Title)}
	for _, team := range comp.TeamNames {
		roleID, matched, unmatched, err := setupTeam(ctx, r, guildID, category.ID(), team, comp, owners, texts, voices)
		if err != nil {
			return fmt.Errorf("set up team %s: %w", team, err)
		}
		lines = append(lines, str.BingoTeam(team, roleID.String(), matched, unmatched))
	}
	return reply.Text(ctx, e, strings.Join(lines, "\n"))
}

// rsnOwners maps lowercased RSNs to the Discord user who linked them.
func (b *bingo) rsnOwners(ctx context.Context, guildID string, comp wom.Competition) (map[string]string, error) {
	var rsns []string
	for _, team := range comp.TeamNames {
		rsns = append(rsns, comp.Teams[team]...)
	}
	owners := map[string]string{}
	for chunk := range slices.Chunk(rsns, 50) {
		users, err := b.d.API.GetUsers(ctx, guildID, tectonic.ByRSN(chunk...))
		if errors.Is(err, tectonic.ErrNotFound) {
			continue
		}
		if err != nil {
			return nil, reply.WithOverrides(err, str.AccountErrors(str.AccountArgs{}))
		}
		for _, u := range users {
			for _, r := range u.RSNs {
				owners[strings.ToLower(r.RSN)] = u.UserID
			}
		}
	}
	return owners, nil
}

func setupTeam(ctx context.Context, r rest.Rest, guildID, categoryID snowflake.ID, team string, comp wom.Competition, owners map[string]string, texts, voices int) (snowflake.ID, []string, []string, error) {
	role, err := r.CreateRole(guildID, discord.RoleCreate{
		Name:        team,
		Color:       rand.IntN(0xFFFFFF),
		Mentionable: true,
	}, rest.WithCtx(ctx), rest.WithReason("Bingo setup: "+comp.Title))
	if err != nil {
		return 0, nil, nil, fmt.Errorf("create role: %w", err)
	}

	var matched, unmatched []string
	for _, rsn := range comp.Teams[team] {
		userID, err := snowflake.Parse(owners[strings.ToLower(rsn)])
		if err == nil {
			err = r.AddMemberRole(guildID, userID, role.ID, rest.WithCtx(ctx))
		}
		if err != nil {
			logging.Logger(ctx).Debug("Couldn't give team role", "rsn", rsn, "team", team, "err", err)
			unmatched = append(unmatched, rsn)
			continue
		}
		matched = append(matched, rsn)
	}

	// Only the team (and admins) can see its channels.
	hidden := discord.RolePermissionOverwrite{RoleID: guildID, Deny: discord.PermissionViewChannel}
	textAccess := []discord.PermissionOverwrite{hidden, discord.RolePermissionOverwrite{RoleID: role.ID, Allow: discord.PermissionViewChannel | discord.PermissionSendMessages}}
	voiceAccess := []discord.PermissionOverwrite{hidden, discord.RolePermissionOverwrite{RoleID: role.ID, Allow: discord.PermissionViewChannel | discord.PermissionConnect | discord.PermissionSpeak}}

	for i := range texts {
		ch := discord.GuildTextChannelCreate{Name: channelName(team, i, texts, "-"), ParentID: categoryID, PermissionOverwrites: textAccess}
		if _, err := r.CreateGuildChannel(guildID, ch, rest.WithCtx(ctx)); err != nil {
			return 0, nil, nil, fmt.Errorf("create text channel: %w", err)
		}
	}
	for i := range voices {
		ch := discord.GuildVoiceChannelCreate{Name: channelName(team, i, voices, " "), ParentID: categoryID, PermissionOverwrites: voiceAccess}
		if _, err := r.CreateGuildChannel(guildID, ch, rest.WithCtx(ctx)); err != nil {
			return 0, nil, nil, fmt.Errorf("create voice channel: %w", err)
		}
	}
	return role.ID, matched, unmatched, nil
}

// channelName numbers channels only when a team has more than one.
func channelName(team string, i, total int, sep string) string {
	if total == 1 {
		return team
	}
	return fmt.Sprintf("%s%s%d", team, sep, i+1)
}

func optInt(data discord.SlashCommandInteractionData, name string, def int) int {
	if v, ok := data.OptInt(name); ok {
		return v
	}
	return def
}
