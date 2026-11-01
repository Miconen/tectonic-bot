// Package preview renders the "If approved:" block of a request
// (utils/requestPreview.ts).
package preview

import (
	"context"
	"strings"

	"github.com/Miconen/tectonic-bot/go/internal/logging"
	"github.com/Miconen/tectonic-bot/go/internal/ranks"
	"github.com/Miconen/tectonic-bot/go/internal/str"
	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
)

// Build shows each user's points and rank after gaining points. Users the API
// doesn't return are shown as a plain mention; an API failure only degrades
// the preview, as in the TS bot.
func Build(ctx context.Context, api *tectonic.Client, rankCache *ranks.Cache, guildID string, userIDs []string, points int) string {
	users, err := api.GetUsers(ctx, guildID, tectonic.ByUserID(userIDs...))
	if err != nil {
		logging.Logger(ctx).Warn("preview: fetching users failed", "err", err)
	}
	return Render(userIDs, users, rankCache.Get(ctx, guildID), points)
}

// Render is the pure part of Build.
func Render(userIDs []string, users []tectonic.DetailedUser, rankList []ranks.Rank, points int) string {
	byID := map[string]tectonic.DetailedUser{}
	for _, u := range users {
		byID[u.UserID] = u
	}

	lines := []string{str.PreviewHeader}
	for _, id := range userIDs {
		u, ok := byID[id]
		if !ok {
			lines = append(lines, str.PreviewUnknown(id))
			continue
		}
		t := ranks.GetTransition(rankList, u.Points, u.Points+points)
		line := str.PreviewLine(id, u.Points, ranks.Icon(t.Old), u.Points+points, ranks.Icon(t.New))
		if t.Changed {
			name := "Unranked"
			if t.New != nil {
				name = t.New.Name
			}
			line += str.PreviewRankChange(points >= 0, ranks.Icon(t.New), str.DisplayName(name))
		}
		lines = append(lines, line)
	}
	return strings.Join(lines, "\n")
}
