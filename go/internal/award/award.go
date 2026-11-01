// Package award gives points and syncs rank roles (src/points/awardPoints.ts).
// Every command that hands out points goes through Give.
package award

import (
	"context"
	"fmt"
	"slices"
	"strings"

	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/snowflake/v2"

	"github.com/Miconen/tectonic-bot/go/internal/deps"
	"github.com/Miconen/tectonic-bot/go/internal/ranks"
	"github.com/Miconen/tectonic-bot/go/internal/str"
	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
)

// ChunkSize is how many user IDs go in one API call.
const ChunkSize = 50

// Give gives points to members, updates rank roles and returns the summary
// message (awardPoints in TS).
func Give(ctx context.Context, d deps.Deps, roles ranks.RoleEditor, guildID snowflake.ID, members []discord.Member, p tectonic.Points) (string, error) {
	byID := make(map[string]discord.Member, len(members))
	ids := make([]string, 0, len(members))
	for _, m := range members {
		id := m.User.ID.String()
		byID[id] = m
		ids = append(ids, id)
	}

	// IDs go in the URL, so large role awards are sent in chunks.
	var res []tectonic.PointsResponse
	for chunk := range slices.Chunk(ids, ChunkSize) {
		part, err := d.API.GivePoints(ctx, guildID.String(), chunk, p)
		if err != nil {
			return "", err
		}
		res = append(res, part...)
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
		lines = append(lines, Format(m.EffectiveName(), entry.GivenPoints, entry.Points, t))
	}
	return strings.Join(lines, "\n"), nil
}

// Format is formatPointsAward in TS.
func Format(displayName string, given, total int, t ranks.Transition) string {
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
