// Package members fetches guild members over REST, so nothing has to stay in
// a member cache.
package members

import (
	"context"
	"errors"
	"net/http"
	"slices"

	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/rest"
	"github.com/disgoorg/snowflake/v2"
)

// Fetch returns the members for ids, skipping users who left the guild. Other
// errors are returned.
func Fetch(ctx context.Context, r rest.Members, guildID snowflake.ID, ids []string) (map[string]discord.Member, error) {
	out := make(map[string]discord.Member, len(ids))
	for _, raw := range ids {
		if _, done := out[raw]; done {
			continue
		}
		id, err := snowflake.Parse(raw)
		if err != nil {
			continue
		}
		m, err := r.GetMember(guildID, id, rest.WithCtx(ctx))
		var restErr *rest.Error
		if errors.As(err, &restErr) && restErr.Response != nil && restErr.Response.StatusCode == http.StatusNotFound {
			continue
		}
		if err != nil {
			return nil, err
		}
		out[raw] = *m
	}
	return out, nil
}

// WithRole lists every member who has roleID, paging through the whole guild
// over REST (the bot doesn't cache members).
func WithRole(ctx context.Context, r rest.Members, guildID, roleID snowflake.ID) ([]discord.Member, error) {
	var out []discord.Member
	var after snowflake.ID
	for {
		page, err := r.GetMembers(guildID, 1000, after, rest.WithCtx(ctx))
		if err != nil {
			return nil, err
		}
		for _, m := range page {
			if slices.Contains(m.RoleIDs, roleID) {
				out = append(out, m)
			}
		}
		if len(page) < 1000 {
			return out, nil
		}
		after = page[len(page)-1].User.ID
	}
}
