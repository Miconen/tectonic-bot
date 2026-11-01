package tectonic

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"
)

// UserQuery selects users by Discord ID, RSN or WOM ID.
type UserQuery struct {
	kind   string // "", "rsn" or "wom"
	values []string
}

func ByUserID(ids ...string) UserQuery { return UserQuery{values: ids} }
func ByRSN(rsns ...string) UserQuery   { return UserQuery{kind: "rsn", values: rsns} }
func ByWomID(ids ...string) UserQuery  { return UserQuery{kind: "wom", values: ids} }

func (q UserQuery) path() string {
	escaped := make([]string, len(q.values))
	for i, v := range q.values {
		escaped[i] = url.PathEscape(v)
	}
	joined := strings.Join(escaped, ",")
	if q.kind == "" {
		return joined
	}
	return q.kind + "/" + joined
}

// GetUser returns the first matching user, or (nil, nil) if the API returns an
// empty list.
func (c *Client) GetUser(ctx context.Context, guildID string, q UserQuery) (*DetailedUser, error) {
	body, err := c.do(ctx, http.MethodGet, c.apiURL, fmt.Sprintf("guilds/%s/users/%s", guildID, q.path()), nil)
	if err != nil {
		return nil, err
	}

	var raws []json.RawMessage
	if err := json.Unmarshal(body, &raws); err != nil {
		return nil, &APIError{Code: CodeUnknown, Message: "Failed to parse JSON response"}
	}
	if len(raws) == 0 {
		return nil, nil
	}

	var u DetailedUser
	if err := json.Unmarshal(raws[0], &u); err != nil {
		return nil, &APIError{Code: CodeUnknown, Message: "Failed to parse JSON response"}
	}
	u.Raw = raws[0]
	return &u, nil
}

func (c *Client) RemoveUser(ctx context.Context, guildID string, q UserQuery) error {
	_, err := c.do(ctx, http.MethodDelete, c.apiURL, fmt.Sprintf("guilds/%s/users/%s", guildID, q.path()), nil)
	return err
}

// Points is either a custom amount or a preset point source.
type Points struct {
	amount float64
	source string
}

func CustomPoints(amount float64) Points { return Points{amount: amount} }
func PresetPoints(source string) Points  { return Points{source: source} }

func (p Points) path() string {
	if p.source != "" {
		return url.PathEscape(p.source)
	}
	return "custom/" + strconv.FormatFloat(p.amount, 'f', -1, 64)
}

func (c *Client) GivePoints(ctx context.Context, guildID string, userIDs []string, p Points) ([]PointsResponse, error) {
	path := fmt.Sprintf("guilds/%s/users/%s/points/%s", guildID, strings.Join(userIDs, ","), p.path())
	return call[[]PointsResponse](ctx, c, http.MethodPut, path)
}

func (c *Client) GetGuild(ctx context.Context, guildID string) (Guild, error) {
	return call[Guild](ctx, c, http.MethodGet, "guilds/"+guildID)
}

func (c *Client) GetGuildRanks(ctx context.Context, guildID string) ([]GuildRank, error) {
	return call[[]GuildRank](ctx, c, http.MethodGet, fmt.Sprintf("guilds/%s/ranks", guildID))
}

func (c *Client) GetGuildRecords(ctx context.Context, guildID string) (GuildRecords, error) {
	return call[GuildRecords](ctx, c, http.MethodGet, fmt.Sprintf("guilds/%s/records", guildID))
}

type PointSource struct {
	Source string `json:"source"`
	Points int    `json:"points"`
	Name   string `json:"name"`
}

func (c *Client) GetGuildPointSources(ctx context.Context, guildID string) ([]PointSource, error) {
	return call[[]PointSource](ctx, c, http.MethodGet, fmt.Sprintf("guilds/%s/points", guildID))
}
