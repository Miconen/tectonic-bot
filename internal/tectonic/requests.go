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
	amount int
	source string
}

// CustomPoints is a whole number: the API rejects fractions.
func CustomPoints(amount int) Points    { return Points{amount: amount} }
func PresetPoints(source string) Points { return Points{source: source} }

func (p Points) path() string {
	if p.source != "" {
		return url.PathEscape(p.source)
	}
	return "custom/" + strconv.Itoa(p.amount)
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

func (c *Client) GetDetailedGuild(ctx context.Context, guildID string) (DetailedGuild, error) {
	return call[DetailedGuild](ctx, c, http.MethodGet, fmt.Sprintf("guilds/%s/records", guildID))
}

type PointSource struct {
	Source string `json:"source"`
	Points int    `json:"points"`
	Name   string `json:"name"`
}

func (c *Client) GetGuildPointSources(ctx context.Context, guildID string) ([]PointSource, error) {
	return call[[]PointSource](ctx, c, http.MethodGet, fmt.Sprintf("guilds/%s/points", guildID))
}

func (c *Client) GetBosses(ctx context.Context) ([]Boss, error) {
	return call[[]Boss](ctx, c, http.MethodGet, "bosses")
}

// GetBasicUsers returns the activated users among ids (others are left out).
func (c *Client) GetBasicUsers(ctx context.Context, guildID string, ids []string) ([]SimpleUser, error) {
	return call[[]SimpleUser](ctx, c, http.MethodGet, fmt.Sprintf("guilds/%s/users/basic/%s", guildID, ByUserID(ids...).path()))
}

func (c *Client) GetUsers(ctx context.Context, guildID string, q UserQuery) ([]DetailedUser, error) {
	return call[[]DetailedUser](ctx, c, http.MethodGet, fmt.Sprintf("guilds/%s/users/%s", guildID, q.path()))
}

func (c *Client) NewRecord(ctx context.Context, guildID string, r NewRecord) (RecordResponse, error) {
	var out RecordResponse
	_, err := c.doJSON(ctx, http.MethodPost, fmt.Sprintf("guilds/%s/records", guildID), r, &out)
	return out, err
}

func (c *Client) GetAchievements(ctx context.Context) ([]Achievement, error) {
	return call[[]Achievement](ctx, c, http.MethodGet, "achievements")
}

func (c *Client) GiveAchievement(ctx context.Context, guildID string, q UserQuery, achievement string) error {
	_, err := c.do(ctx, http.MethodPost, c.apiURL, fmt.Sprintf("guilds/%s/users/%s/achievements/%s", guildID, q.path(), url.PathEscape(achievement)), nil)
	return err
}

func (c *Client) RemoveAchievement(ctx context.Context, guildID string, q UserQuery, achievement string) error {
	_, err := c.do(ctx, http.MethodDelete, c.apiURL, fmt.Sprintf("guilds/%s/users/%s/achievements/%s", guildID, q.path(), url.PathEscape(achievement)), nil)
	return err
}

func (c *Client) GetGuildCombatAchievements(ctx context.Context, guildID string) ([]CombatAchievement, error) {
	return call[[]CombatAchievement](ctx, c, http.MethodGet, fmt.Sprintf("guilds/%s/combat-achievements", guildID))
}

// CompleteCombatAchievement marks a CA done for users and awards its points.
func (c *Client) CompleteCombatAchievement(ctx context.Context, guildID, ca string, userIDs []string) ([]PointsResponse, error) {
	var out []PointsResponse
	_, err := c.doJSON(ctx, http.MethodPost, fmt.Sprintf("guilds/%s/combat-achievements/%s/complete", guildID, url.PathEscape(ca)), map[string][]string{"user_ids": userIDs}, &out)
	return out, err
}

func (c *Client) GiveUserCombatAchievement(ctx context.Context, guildID, userID, ca string) error {
	_, err := c.do(ctx, http.MethodPost, c.apiURL, fmt.Sprintf("guilds/%s/users/%s/combat-achievements/%s", guildID, userID, url.PathEscape(ca)), nil)
	return err
}

func (c *Client) RemoveUserCombatAchievement(ctx context.Context, guildID, userID, ca string) error {
	_, err := c.do(ctx, http.MethodDelete, c.apiURL, fmt.Sprintf("guilds/%s/users/%s/combat-achievements/%s", guildID, userID, url.PathEscape(ca)), nil)
	return err
}
