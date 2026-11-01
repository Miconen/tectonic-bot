// Package events holds gateway event listeners (src/events in TS).
package events

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/disgoorg/disgo/bot"
	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/events"
	"github.com/disgoorg/disgo/rest"
	"github.com/disgoorg/snowflake/v2"

	"github.com/Miconen/tectonic-bot/go/internal/logging"
	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
)

// OnMemberLeave dumps a leaving member's data to the log (or mod) channel and
// removes them from the API (removeOnLeave.ts). It fires for every leave,
// cached member or not.
func OnMemberLeave(api *tectonic.Client) func(*events.GuildMemberLeave) {
	return func(e *events.GuildMemberLeave) {
		ctx, _ := logging.WithCorrelationID(context.Background())
		ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
		defer cancel()

		guildID, userID := e.GuildID.String(), e.User.ID.String()
		log := logging.Logger(ctx).With("user", userID, "guild", guildID)

		u, err := api.GetUser(ctx, guildID, tectonic.ByUserID(userID))
		if err != nil || u == nil {
			log.Debug("Leaving member is not in database, skipping removal")
			return
		}

		if err := dumpUserData(ctx, e.Client(), api, e.GuildID, u, "Leaving Server"); err != nil {
			log.Warn("Failed to dump leaving user's data", "err", err)
		}

		if err := api.RemoveUser(ctx, guildID, tectonic.ByUserID(userID)); err != nil {
			log.Error("Failed to remove leaving user", "err", err)
		}
	}
}

// dumpUserData posts the user's full API payload as a JSON file, preferring the
// log channel over the mod channel (utils/dumpUserData.ts).
func dumpUserData(ctx context.Context, client *bot.Client, api *tectonic.Client, guildID snowflake.ID, u *tectonic.DetailedUser, reason string) error {
	guild, err := api.GetGuild(ctx, guildID.String())
	if err != nil {
		return fmt.Errorf("fetch guild config: %w", err)
	}

	channel := guild.LogChannelID
	if channel == nil {
		channel = guild.ModChannelID
	}
	if channel == nil {
		return errors.New("no log or mod channel configured for guild")
	}
	channelID, err := snowflake.Parse(*channel)
	if err != nil {
		return fmt.Errorf("parse channel id %q: %w", *channel, err)
	}

	var pretty bytes.Buffer
	if err := json.Indent(&pretty, u.Raw, "", "  "); err != nil {
		return fmt.Errorf("format user dump: %w", err)
	}

	_, err = client.Rest.CreateMessage(channelID, discord.MessageCreate{
		Content: fmt.Sprintf("Dumping data of member before removal.  <@%s> (`%s`) Reason: %s", u.UserID, u.UserID, reason),
		Files:   []*discord.File{discord.NewFile(fmt.Sprintf("user-%s-%d.json", u.UserID, time.Now().UnixMilli()), "", &pretty)},
	}, rest.WithCtx(ctx))
	return err
}
