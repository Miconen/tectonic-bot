package pb

import (
	"context"
	"fmt"
	"sort"
	"strconv"

	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/handler"
	"github.com/disgoorg/disgo/rest"
	"github.com/disgoorg/snowflake/v2"

	"github.com/Miconen/tectonic-bot/internal/catalog"
	"github.com/Miconen/tectonic-bot/internal/deps"
	"github.com/Miconen/tectonic-bot/internal/logging"
	. "github.com/Miconen/tectonic-bot/internal/opt"
	"github.com/Miconen/tectonic-bot/internal/reply"
	"github.com/Miconen/tectonic-bot/internal/str"
	"github.com/Miconen/tectonic-bot/internal/tectonic"
)

// TimesGroup is /moderation times. It lives here because it edits the same
// records and leaderboard embeds as /pb.
var TimesGroup = Group("times", "Manage clan PB records",
	Sub("remove", "Remove a specific record",
		Autocomplete("record", "Record to remove")),
	Sub("adduser", "Add a user to the team of a boss's clan PB",
		User("username", "@User tag to add to a time"),
		Autocomplete("boss", "Boss to add the user to")),
	Sub("removeuser", "Remove a user from the team of a boss's clan PB",
		User("username", "@User tag to remove from a time"),
		Autocomplete("boss", "Boss to remove the user from")),
	Sub("initialize-pb-channel", "Post the leaderboard embeds in this channel"),
)

// RegisterTimes adds the /times routes to an already prefixed router.
func RegisterTimes(r handler.Router, d deps.Deps) {
	t := &times{d: d}
	r.Route("/times", func(r handler.Router) {
		r.SlashCommand("/remove", t.remove)
		r.Autocomplete("/remove", t.recordAutocomplete)
		r.SlashCommand("/adduser", t.teammate(d.API.AddTeammate, str.TeammateAdded))
		r.SlashCommand("/removeuser", t.teammate(d.API.RemoveTeammate, str.TeammateRemoved))
		r.Autocomplete("/adduser", t.bossAutocomplete)
		r.Autocomplete("/removeuser", t.bossAutocomplete)
		r.SlashCommand("/initialize-pb-channel", t.initialize)
	})
}

type times struct{ d deps.Deps }

// remove deletes a record and, unlike the TS bot, redraws the leaderboard so
// a removed #1 doesn't linger in the embed.
func (t *times) remove(data discord.SlashCommandInteractionData, e *handler.CommandEvent) error {
	ctx := e.Ctx
	raw := data.String("record")
	id, err := strconv.Atoi(raw)
	if err != nil {
		return reply.UserError(str.RecordNotFound(raw))
	}
	if err := reply.Defer(ctx, e, true); err != nil {
		return err
	}

	guildID := e.GuildID().String()
	g, err := t.d.API.GetDetailedGuild(ctx, guildID)
	if err != nil {
		return reply.WithOverrides(err, str.RecordErrors())
	}
	rec, ok := findRecord(g, id)
	if !ok {
		return reply.UserError(str.RecordNotFound(raw))
	}
	if err := t.d.API.RemoveRecord(ctx, guildID, id); err != nil {
		return reply.WithOverrides(err, str.RecordErrors())
	}

	msg := str.RecordRemoved(id, recordLabel(g, rec))
	if rec.Position == 1 {
		msg += t.redraw(ctx, e, rec.BossName)
	}
	return reply.Ephemeral(ctx, e, msg)
}

type teamCall func(ctx context.Context, guildID, boss, userID string) error

func (t *times) teammate(call teamCall, done func(user, boss string) string) handler.SlashCommandHandler {
	return func(data discord.SlashCommandInteractionData, e *handler.CommandEvent) error {
		ctx := e.Ctx
		user := data.User("username")
		name := user.EffectiveName()
		if m, ok := data.OptMember("username"); ok && m.Nick != nil {
			name = *m.Nick
		}
		boss := data.String("boss")
		if err := reply.Defer(ctx, e, true); err != nil {
			return err
		}
		if err := call(ctx, e.GuildID().String(), boss, user.ID.String()); err != nil {
			return reply.WithOverrides(err, str.RecordErrors())
		}
		return reply.Ephemeral(ctx, e, done(name, boss)+t.redraw(ctx, e, boss))
	}
}

// redraw updates the boss's embed and returns a warning line if that failed.
func (t *times) redraw(ctx context.Context, e *handler.CommandEvent, boss string) string {
	if err := updateEmbed(ctx, t.d.API, e.Client().Rest, *e.GuildID(), boss); err != nil {
		logging.Logger(ctx).Warn("Failed to update leaderboard embed", "err", err)
		return "\n-# " + str.PBFailedUpdatingEmbed
	}
	return ""
}

// initialize replaces the leaderboard embeds with fresh ones in this channel
// and stores their message IDs so new PBs can edit them.
func (t *times) initialize(_ discord.SlashCommandInteractionData, e *handler.CommandEvent) error {
	ctx := e.Ctx
	if err := reply.Defer(ctx, e, true); err != nil {
		return err
	}
	guildID := e.GuildID().String()
	g, err := t.d.API.GetDetailedGuild(ctx, guildID)
	if err != nil {
		return reply.WithOverrides(err, str.GuildErrors(str.GuildArgs{}))
	}
	cats := boards(g)
	if len(cats) == 0 {
		return reply.UserError(str.TimesNoBoards)
	}

	r := e.Client().Rest
	deleteOldBoards(ctx, r, g, cats)

	names, err := teamNames(ctx, r, *e.GuildID(), cats...)
	if err != nil {
		return err
	}
	channelID := e.Channel().ID()
	update := tectonic.PBUpdate{ChannelID: channelID.String()}
	for _, c := range cats {
		msg, err := r.CreateMessage(channelID, discord.MessageCreate{Embeds: []discord.Embed{renderEmbed(c, names)}}, rest.WithCtx(ctx))
		if err != nil {
			return fmt.Errorf("post %s embed: %w", c.Name, err)
		}
		update.CategoryMessages = append(update.CategoryMessages, tectonic.CategoryMessage{MessageID: msg.ID.String(), Category: c.Name})
	}

	if err := t.d.API.UpdateGuild(ctx, guildID, tectonic.GuildUpdate{PBUpdate: &update}); err != nil {
		logging.Logger(ctx).Error("Failed to store embed message IDs", "err", err)
		return reply.SystemError(str.TimesEmbedsNotSaved)
	}
	return reply.Ephemeral(ctx, e, str.TimesBoardsCreated)
}

// deleteOldBoards removes the previous embeds one by one. The TS bot used a
// bulk delete, which Discord refuses for messages older than two weeks, so old
// boards were left behind.
func deleteOldBoards(ctx context.Context, r rest.Rest, g tectonic.DetailedGuild, cats []boardCategory) {
	if g.PBChannelID == nil {
		return
	}
	channelID, err := snowflake.Parse(*g.PBChannelID)
	if err != nil {
		return
	}
	for _, c := range cats {
		id, err := snowflake.Parse(c.messageID)
		if err != nil {
			continue
		}
		if err := r.DeleteMessage(channelID, id, rest.WithCtx(ctx)); err != nil {
			logging.Logger(ctx).Debug("Old leaderboard embed already gone", "category", c.Name, "err", err)
		}
	}
}

func findRecord(g tectonic.DetailedGuild, id int) (tectonic.GuildRecord, bool) {
	for _, r := range g.Records {
		if r.RecordID == id {
			return r, true
		}
	}
	return tectonic.GuildRecord{}, false
}

func bossOf(g tectonic.DetailedGuild, name string) (tectonic.Boss, bool) {
	for _, b := range g.Bosses {
		if b.Name == name {
			return b, true
		}
	}
	return tectonic.Boss{}, false
}

// recordLabel is "Category | Boss #1 - 01:23.40".
func recordLabel(g tectonic.DetailedGuild, r tectonic.GuildRecord) string {
	b, ok := bossOf(g, r.BossName)
	if !ok {
		return fmt.Sprintf("%s #%d", r.BossName, r.Position)
	}
	return fmt.Sprintf("%s | %s #%d - %s", b.Category, b.DisplayName, r.Position, display(b, r.Value))
}

// recordAutocomplete lists every record, by boss then position.
func (t *times) recordAutocomplete(e *handler.AutocompleteEvent) error {
	g, err := t.d.API.GetDetailedGuild(e.Ctx, e.GuildID().String())
	if err != nil {
		return err
	}
	recs := append([]tectonic.GuildRecord(nil), g.Records...)
	sort.Slice(recs, func(i, j int) bool {
		if recs[i].BossName != recs[j].BossName {
			return recs[i].BossName < recs[j].BossName
		}
		return recs[i].Position < recs[j].Position
	})
	return e.AutocompleteResult(catalog.Choices(recs, e.Data.Focused().String(),
		func(r tectonic.GuildRecord) string { return truncate(recordLabel(g, r), 100) },
		func(r tectonic.GuildRecord) string { return strconv.Itoa(r.RecordID) }))
}

// bossAutocomplete lists bosses that have a #1 record (the only ones with a
// team to edit).
func (t *times) bossAutocomplete(e *handler.AutocompleteEvent) error {
	g, err := t.d.API.GetDetailedGuild(e.Ctx, e.GuildID().String())
	if err != nil {
		return err
	}
	var tops []tectonic.GuildRecord
	for _, r := range g.Records {
		if r.Position == 1 {
			tops = append(tops, r)
		}
	}
	return e.AutocompleteResult(catalog.Choices(tops, e.Data.Focused().String(),
		func(r tectonic.GuildRecord) string { return truncate(recordLabel(g, r), 100) },
		func(r tectonic.GuildRecord) string { return r.BossName }))
}

func truncate(s string, n int) string {
	if r := []rune(s); len(r) > n {
		return string(r[:n-3]) + "..."
	}
	return s
}
