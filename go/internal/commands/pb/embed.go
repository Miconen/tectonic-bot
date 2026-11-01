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

// categoryFor finds the board category a boss is shown in (the subset of
// formatGuildTimesForEmbeds that one embed update needs).
func categoryFor(g tectonic.DetailedGuild, bossName string) (boardCategory, bool) {
	catName := ""
	for _, gb := range g.GuildBosses {
		if gb.Boss == bossName {
			catName = gb.Category
		}
	}
	if catName == "" {
		return boardCategory{}, false
	}

	var out boardCategory
	found := false
	for _, c := range g.Categories {
		if c.Name == catName {
			out.Category, found = c, true
		}
	}
	for _, gc := range g.GuildCategories {
		if gc.Category == catName && gc.MessageID != nil {
			out.messageID = *gc.MessageID
		}
	}
	if !found {
		return boardCategory{}, false
	}

	bossInfo := map[string]tectonic.Boss{}
	for _, b := range g.Bosses {
		bossInfo[b.Name] = b
	}
	for _, gb := range g.GuildBosses {
		info, ok := bossInfo[gb.Boss]
		if gb.Category != catName || !ok {
			continue
		}
		bb := boardBoss{Boss: info}
		for _, rec := range g.Records {
			if rec.BossName == gb.Boss && rec.Position == 1 {
				v := rec.Value
				bb.value = &v
				for _, t := range g.Teammates {
					if t.RecordID == rec.RecordID {
						bb.teamIDs = append(bb.teamIDs, t.UserID)
					}
				}
			}
		}
		out.bosses = append(out.bosses, bb)
	}
	sort.Slice(out.bosses, func(i, j int) bool { return out.bosses[i].Name < out.bosses[j].Name })
	return out, true
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

	var ids []string
	for _, b := range c.bosses {
		ids = append(ids, b.teamIDs...)
	}
	found, err := members.Fetch(ctx, r, guildID, ids)
	if err != nil {
		return err
	}
	names := make(map[string]string, len(found))
	for id, m := range found {
		names[id] = m.EffectiveName()
	}

	embeds := []discord.Embed{renderEmbed(c, names)}
	_, err = r.UpdateMessage(channelID, messageID, discord.MessageUpdate{Embeds: &embeds}, rest.WithCtx(ctx))
	return err
}
