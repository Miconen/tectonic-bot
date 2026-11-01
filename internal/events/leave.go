// Package events holds gateway event listeners (src/events in TS).
package events

import (
	"context"
	"time"

	"github.com/disgoorg/disgo/events"

	"github.com/Miconen/tectonic-bot/internal/logging"
	"github.com/Miconen/tectonic-bot/internal/tectonic"
	"github.com/Miconen/tectonic-bot/internal/userdump"
)

// OnMemberLeave dumps a leaving member's data to the log (or mod) channel and
// removes them from the API (removeOnLeave.ts). It fires for every leave,
// cached member or not.
func OnMemberLeave(api *tectonic.Client) func(*events.GuildMemberLeave) {
	return func(e *events.GuildMemberLeave) {
		ctx, _ := logging.WithCorrelationID(context.Background())
		ctx = logging.With(logging.WithActor(ctx, e.User.ID.String()), "guild_id", e.GuildID.String(), "event", "member_leave")
		ctx, cancel := context.WithTimeout(ctx, 30*time.Second)
		defer cancel()

		guildID, userID := e.GuildID.String(), e.User.ID.String()
		log := logging.Logger(ctx).With("user", userID, "guild", guildID)

		u, err := api.GetUser(ctx, guildID, tectonic.ByUserID(userID))
		if err != nil || u == nil {
			log.Debug("Leaving member is not in database, skipping removal")
			return
		}

		if err := userdump.Post(ctx, e.Client().Rest, api, e.GuildID, u, userdump.ReasonLeft); err != nil {
			log.Warn("Failed to dump leaving user's data", "err", err)
		}

		if err := api.RemoveUser(ctx, guildID, tectonic.ByUserID(userID)); err != nil {
			log.Error("Failed to remove leaving user", "err", err)
		}
	}
}
