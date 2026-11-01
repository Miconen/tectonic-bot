// Package members fetches guild members over REST, so nothing has to stay in
// a member cache.
package members

import (
	"context"
	"errors"
	"net/http"

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
