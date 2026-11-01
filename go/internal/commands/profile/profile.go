// Package profile ports /profile (src/commands/profile).
package profile

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/handler"
	"github.com/disgoorg/disgo/rest"
	"github.com/disgoorg/snowflake/v2"

	"github.com/Miconen/tectonic-bot/go/internal/deps"
	"github.com/Miconen/tectonic-bot/go/internal/ranks"
	"github.com/Miconen/tectonic-bot/go/internal/reply"
	"github.com/Miconen/tectonic-bot/go/internal/str"
	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
	"github.com/Miconen/tectonic-bot/go/internal/timefmt"
)

var Command = discord.SlashCommandCreate{
	Name:        "profile",
	Description: "Check your or someone elses profile",
	Options: []discord.ApplicationCommandOption{
		discord.ApplicationCommandOptionUser{
			Name:        "username",
			Description: "Leave blank to check personal profile or supply a name to check another user.",
		},
		discord.ApplicationCommandOptionString{
			Name:        "rsn",
			Description: "RSN connected to the user profile.",
		},
	},
}

func Register(r handler.Router, d deps.Deps) {
	r.SlashCommand("/profile", func(data discord.SlashCommandInteractionData, e *handler.CommandEvent) error {
		return handle(d, data, e)
	})
}

func handle(d deps.Deps, data discord.SlashCommandInteractionData, e *handler.CommandEvent) error {
	ctx := e.Ctx
	user, hasUser := data.OptUser("username")
	rsn, hasRSN := data.OptString("rsn")

	if hasUser && hasRSN {
		return reply.Ephemeral(ctx, e, str.ConflictingParams("username", "rsn"))
	}

	if err := reply.Defer(ctx, e, false); err != nil {
		return err
	}

	guildID := *e.GuildID()

	// Who are we looking up, and what do we say if they don't exist?
	var query tectonic.UserQuery
	var notFound string
	switch {
	case hasRSN:
		query = tectonic.ByRSN(rsn)
		notFound = str.RSNNotBound(rsn)
	case hasUser:
		name := user.EffectiveName()
		if m, ok := data.OptMember("username"); ok && m.Nick != nil {
			name = *m.Nick
		}
		query = tectonic.ByUserID(user.ID.String())
		notFound = str.NotActivated(name)
	default:
		query = tectonic.ByUserID(e.User().ID.String())
		notFound = str.NotActivated(e.Member().EffectiveName())
	}

	u, err := d.API.GetUser(ctx, guildID.String(), query)
	if err != nil {
		return reply.WithOverrides(err, str.AccountErrors(str.AccountArgs{}))
	}
	if u == nil {
		return reply.Text(ctx, e, notFound)
	}

	userID, err := snowflake.Parse(u.UserID)
	if err != nil {
		return fmt.Errorf("parse user id %q: %w", u.UserID, err)
	}
	member, err := e.Client().Rest.GetMember(guildID, userID, rest.WithCtx(ctx))
	if err != nil {
		return fmt.Errorf("fetch member %s: %w", userID, err)
	}

	guildRecords, err := d.API.GetDetailedGuild(ctx, guildID.String())
	if err != nil {
		return reply.WithOverrides(err, str.RecordErrors())
	}

	rankList := d.Ranks.Get(ctx, guildID.String())
	return reply.Text(ctx, e, render(member.EffectiveName(), u, guildRecords, rankList))
}

type displayRecord struct {
	tectonic.UserRecord
	position string
}

// render builds the profile text. It's a pure function so it can be tested
// without Discord.
func render(displayName string, u *tectonic.DetailedUser, guild tectonic.DetailedGuild, rankList []ranks.Rank) string {
	rank := ranks.TierFor(u.Points, rankList)
	next := ranks.NextTier(u.Points, rankList)
	toNext := "0"
	if n, ok := ranks.PointsToNext(u.Points, rankList); ok {
		toNext = strconv.Itoa(n)
	}

	rankPrefix := "?"
	if u.Rank != 0 {
		rankPrefix = "#" + strconv.Itoa(u.Rank)
	}

	var validEvents []tectonic.UserEvent
	for _, ev := range u.Events {
		if ev.PositionCutoff >= ev.Placement {
			validEvents = append(validEvents, ev)
		}
	}

	// Clan records this user is part of, keeping the best position per boss.
	inRecord := map[int]bool{}
	for _, t := range guild.Teammates {
		if t.UserID == u.UserID {
			inRecord[t.RecordID] = true
		}
	}
	bestByBoss := map[string]tectonic.GuildRecord{}
	bestIDs := map[int]bool{}
	for _, r := range guild.Records {
		if !inRecord[r.RecordID] {
			continue
		}
		if cur, ok := bestByBoss[r.BossName]; !ok || r.Position < cur.Position {
			bestByBoss[r.BossName] = r
		}
	}
	for _, r := range bestByBoss {
		bestIDs[r.RecordID] = true
	}

	var records []displayRecord
	for _, r := range u.Records {
		if !bestIDs[r.RecordID] {
			continue
		}
		pos := "?"
		if b, ok := bestByBoss[r.BossName]; ok {
			pos = strconv.Itoa(b.Position)
		}
		records = append(records, displayRecord{UserRecord: r, position: pos})
	}

	lines := []string{str.ProfileHeader(str.ProfileHeaderArgs{
		RankIcon:     ranks.Icon(rank),
		Username:     displayName,
		RankPrefix:   rankPrefix,
		Points:       u.Points,
		PBCount:      len(records),
		EventCount:   len(validEvents),
		NextRankIcon: ranks.Icon(next),
		PointsToNext: toNext,
	})}

	if len(u.RSNs) > 0 {
		lines = append(lines, str.ProfileAccountsHeader)
		for _, a := range u.RSNs {
			lines = append(lines, str.ProfileAccountEntry(a.RSN))
		}
	} else {
		lines = append(lines, "`"+str.NoLinkedAccounts+"`")
	}

	if len(records) > 0 {
		lines = append(lines, str.ProfilePBsHeader)
		for _, r := range records {
			value := strconv.Itoa(r.Value)
			if r.ValueType == "time" {
				value = timefmt.TicksToTime(r.Value)
			}
			lines = append(lines, str.ProfilePBEntry(r.position, r.Category, r.DisplayName, value))
		}
	}

	if len(validEvents) > 0 {
		lines = append(lines, str.ProfileEventsHeader)
		for _, ev := range validEvents {
			legacy := strings.HasPrefix(ev.WomID, "legacy_")
			winner := (!ev.Solo && ev.PositionCutoff == 1) || (legacy && ev.Placement == 1)

			chunk := str.ProfileEventPlacementChunk(ev.Placement)
			if winner {
				chunk = str.ProfileEventWinnerChunk
			}
			lines = append(lines, str.ProfileEventEntry(chunk, ev.Name, ev.WomID))
		}
	}

	if len(u.Achievements) > 0 {
		lines = append(lines, str.ProfileAchievementsHeader)
		for _, a := range u.Achievements {
			lines = append(lines, str.ProfileAchievementEntry(a.DiscordIcon, a.Name))
		}
	}

	return strings.Join(lines, "\n")
}
