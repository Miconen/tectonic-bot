package pb

import (
	"context"
	"errors"
	"fmt"
	"sort"
	"strings"

	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/rest"
	"github.com/disgoorg/snowflake/v2"

	"github.com/Miconen/tectonic-bot/go/internal/members"
	"github.com/Miconen/tectonic-bot/go/internal/str"
	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
)

const embedColor = 0xE00000

// boardCategory is one leaderboard embed: a category and its bosses' #1s.
type boardCategory struct {
	tectonic.Category
	messageID string
	bosses    []boardBoss
}

type boardBoss struct {
	tectonic.Boss
	value   *int
	teamIDs []string
}

// boards builds every leaderboard embed the guild has, in category order
// (formatGuildTimesForEmbeds in TS).
func boards(g tectonic.DetailedGuild) []boardCategory {
	cats := map[string]tectonic.Category{}
	for _, c := range g.Categories {
		cats[c.Name] = c
	}
	bossInfo := map[string]tectonic.Boss{}
	for _, b := range g.Bosses {
		bossInfo[b.Name] = b
	}

	var out []boardCategory
	for _, gc := range g.GuildCategories {
		c, ok := cats[gc.Category]
		if !ok {
			continue
		}
		bc := boardCategory{Category: c}
		if gc.MessageID != nil {
			bc.messageID = *gc.MessageID
		}
		for _, gb := range g.GuildBosses {
			info, ok := bossInfo[gb.Boss]
			if gb.Category != c.Name || !ok {
				continue
			}
			bc.bosses = append(bc.bosses, topRecord(g, info))
		}
		sort.Slice(bc.bosses, func(i, j int) bool { return bc.bosses[i].Name < bc.bosses[j].Name })
		out = append(out, bc)
	}
	sort.SliceStable(out, func(i, j int) bool { return out[i].Order < out[j].Order })
	return out
}

// topRecord is the boss with its #1 record and team, if any.
func topRecord(g tectonic.DetailedGuild, boss tectonic.Boss) boardBoss {
	bb := boardBoss{Boss: boss}
	for _, rec := range g.Records {
		if rec.BossName != boss.Name || rec.Position != 1 {
			continue
		}
		v := rec.Value
		bb.value = &v
		for _, t := range g.Teammates {
			if t.RecordID == rec.RecordID {
				bb.teamIDs = append(bb.teamIDs, t.UserID)
			}
		}
	}
	return bb
}

// categoryFor finds the board a boss is shown in.
func categoryFor(g tectonic.DetailedGuild, bossName string) (boardCategory, bool) {
	catName := ""
	for _, gb := range g.GuildBosses {
		if gb.Boss == bossName {
			catName = gb.Category
		}
	}
	for _, c := range boards(g) {
		if catName != "" && c.Name == catName {
			return c, true
		}
	}
	return boardCategory{}, false
}

// teamNames maps every board player's ID to their display name. Players who
// left are missing, and renderEmbed shows them as mentions.
func teamNames(ctx context.Context, r rest.Members, guildID snowflake.ID, cats ...boardCategory) (map[string]string, error) {
	var ids []string
	for _, c := range cats {
		for _, b := range c.bosses {
			ids = append(ids, b.teamIDs...)
		}
	}
	found, err := members.Fetch(ctx, r, guildID, ids)
	if err != nil {
		return nil, err
	}
	names := make(map[string]string, len(found))
	for id, m := range found {
		names[id] = m.EffectiveName()
	}
	return names, nil
}

// renderEmbed builds the category's leaderboard embed. names maps user IDs to
// display names; missing users are shown as mentions.
func renderEmbed(c boardCategory, names map[string]string) discord.Embed {
	fields := make([]discord.EmbedField, 0, len(c.bosses))
	for _, b := range c.bosses {
		value := str.PBNoRecordYet
		if b.value != nil {
			value = "`" + display(b.Boss, *b.value) + "`"
		}
		var team []string
		for _, id := range b.teamIDs {
			name, ok := names[id]
			if !ok {
				name = "<@" + id + ">"
			}
			team = append(team, "**"+name+"**")
		}
		if len(team) > 0 {
			value += " - " + strings.Join(team, ", ")
		}
		fields = append(fields, discord.EmbedField{Name: b.DisplayName, Value: value})
	}
	return discord.Embed{
		Title:     c.Name,
		Color:     embedColor,
		Thumbnail: &discord.EmbedResource{URL: c.Thumbnail},
		Fields:    fields,
	}
}

// updateEmbed redraws the leaderboard embed that shows bossName.
func updateEmbed(ctx context.Context, api *tectonic.Client, r rest.Rest, guildID snowflake.ID, bossName string) error {
	g, err := api.GetDetailedGuild(ctx, guildID.String())
	if err != nil {
		return err
	}
	c, ok := categoryFor(g, bossName)
	if !ok || c.messageID == "" || g.PBChannelID == nil {
		return errors.New("no leaderboard embed for this boss")
	}
	channelID, err := snowflake.Parse(*g.PBChannelID)
	if err != nil {
		return fmt.Errorf("parse pb channel: %w", err)
	}
	messageID, err := snowflake.Parse(c.messageID)
	if err != nil {
		return fmt.Errorf("parse embed message: %w", err)
	}

	names, err := teamNames(ctx, r, guildID, c)
	if err != nil {
		return err
	}

	embeds := []discord.Embed{renderEmbed(c, names)}
	_, err = r.UpdateMessage(channelID, messageID, discord.MessageUpdate{Embeds: &embeds}, rest.WithCtx(ctx))
	return err
}
