// Package userdump posts a user's full API payload to the guild's log channel
// before their data is deleted (utils/dumpUserData.ts). Leaving the server and
// /moderation status deactivate both use it.
package userdump

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/rest"
	"github.com/disgoorg/snowflake/v2"

	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
)

// Reasons shown in the dump message.
const (
	ReasonLeft        = "Leaving Server"
	ReasonDeactivated = "Deactivation"
)

// Post sends the dump as a JSON file, preferring the log channel over the mod
// channel.
func Post(ctx context.Context, r rest.Channels, api *tectonic.Client, guildID snowflake.ID, u *tectonic.DetailedUser, reason string) error {
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

	_, err = r.CreateMessage(channelID, discord.MessageCreate{
		Content: fmt.Sprintf("Dumping data of member before removal.  <@%s> (`%s`) Reason: %s", u.UserID, u.UserID, reason),
		Files:   []*discord.File{discord.NewFile(fmt.Sprintf("user-%s-%d.json", u.UserID, time.Now().UnixMilli()), "", &pretty)},
	}, rest.WithCtx(ctx))
	return err
}
