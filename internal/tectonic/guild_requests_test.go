package tectonic

import (
	"context"
	"io"
	"net/http"
	"testing"
)

// The API treats missing fields as "leave unchanged", so partial updates must
// not send zero values.
func TestPartialBodies(t *testing.T) {
	var got string
	c := newTestServer(t, func(w http.ResponseWriter, r *http.Request) {
		b, _ := io.ReadAll(r.Body)
		got = r.Method + " " + r.URL.EscapedPath() + " " + string(b)
		w.WriteHeader(http.StatusNoContent)
	})
	ctx := context.Background()
	n, id := 3, "42"

	cases := []struct {
		call func() error
		want string
	}{
		{func() error { return c.UpdateGuild(ctx, "1", GuildUpdate{PositionCount: &n}) }, `PUT /api/v1/guilds/1 {"position_count":3}`},
		{func() error { return c.UpdateGuild(ctx, "1", GuildUpdate{ModChannelID: &id}) }, `PUT /api/v1/guilds/1 {"mod_channel_id":"42"}`},
		{func() error { return c.UpdateGuildRank(ctx, "1", "rune tier", RankFields{MinPoints: &n}) }, `PUT /api/v1/guilds/1/ranks/rune%20tier {"min_points":3}`},
		{func() error { return c.CreateGuildRank(ctx, "1", "jade", RankFields{MinPoints: &n, DisplayOrder: &n}) }, `POST /api/v1/guilds/1/ranks {"name":"jade","min_points":3,"display_order":3}`},
		{func() error { return c.AddRSN(ctx, "1", "2", "Zezima") }, `POST /api/v1/guilds/1/users/2/rsns {"rsn":"Zezima"}`},
		{func() error { return c.RemoveRSN(ctx, "1", "2", "Iron Zez") }, `DELETE /api/v1/guilds/1/users/2/rsns/Iron%20Zez `},
	}
	for _, c := range cases {
		if err := c.call(); err != nil {
			t.Fatal(err)
		}
		if got != c.want {
			t.Errorf("got  %s\nwant %s", got, c.want)
		}
	}
}
