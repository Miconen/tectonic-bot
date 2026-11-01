package tectonic

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
)

// GuildUpdate changes guild settings. Nil fields are left as they are.
type GuildUpdate struct {
	Multiplier    *int      `json:"multiplier,omitempty"`
	ModChannelID  *string   `json:"mod_channel_id,omitempty"`
	LogChannelID  *string   `json:"log_channel_id,omitempty"`
	PBUpdate      *PBUpdate `json:"pb_update,omitempty"`
	PositionCount *int      `json:"position_count,omitempty"`
}

// PBUpdate stores where the PB embeds live (one message per category).
type PBUpdate struct {
	ChannelID        string            `json:"channel_id"`
	CategoryMessages []CategoryMessage `json:"category_messages"`
}

type CategoryMessage struct {
	MessageID string `json:"message_id"`
	Category  string `json:"category"`
}

func (c *Client) CreateGuild(ctx context.Context, guildID string) error {
	_, err := c.doJSON(ctx, http.MethodPost, "guilds", map[string]string{"guild_id": guildID}, nil)
	return err
}

func (c *Client) UpdateGuild(ctx context.Context, guildID string, u GuildUpdate) error {
	_, err := c.doJSON(ctx, http.MethodPut, "guilds/"+guildID, u, nil)
	return err
}

func (c *Client) CreateUser(ctx context.Context, guildID, userID, rsn string) error {
	_, err := c.doJSON(ctx, http.MethodPost, fmt.Sprintf("guilds/%s/users", guildID), map[string]string{"user_id": userID, "rsn": rsn}, nil)
	return err
}

func (c *Client) AddRSN(ctx context.Context, guildID, userID, rsn string) error {
	_, err := c.doJSON(ctx, http.MethodPost, fmt.Sprintf("guilds/%s/users/%s/rsns", guildID, userID), map[string]string{"rsn": rsn}, nil)
	return err
}

func (c *Client) RemoveRSN(ctx context.Context, guildID, userID, rsn string) error {
	_, err := c.do(ctx, http.MethodDelete, c.apiURL, fmt.Sprintf("guilds/%s/users/%s/rsns/%s", guildID, userID, url.PathEscape(rsn)), nil)
	return err
}

// RankFields are the editable parts of a guild rank. On update, nil fields
// are left as they are.
type RankFields struct {
	MinPoints    *int    `json:"min_points,omitempty"`
	Icon         *string `json:"icon,omitempty"`
	RoleID       *string `json:"role_id,omitempty"`
	DisplayOrder *int    `json:"display_order,omitempty"`
}

func (c *Client) CreateGuildRank(ctx context.Context, guildID, name string, f RankFields) error {
	body := struct {
		Name string `json:"name"`
		RankFields
	}{name, f}
	_, err := c.doJSON(ctx, http.MethodPost, fmt.Sprintf("guilds/%s/ranks", guildID), body, nil)
	return err
}

func (c *Client) UpdateGuildRank(ctx context.Context, guildID, name string, f RankFields) error {
	_, err := c.doJSON(ctx, http.MethodPut, fmt.Sprintf("guilds/%s/ranks/%s", guildID, url.PathEscape(name)), f, nil)
	return err
}

func (c *Client) DeleteGuildRank(ctx context.Context, guildID, name string) error {
	_, err := c.do(ctx, http.MethodDelete, c.apiURL, fmt.Sprintf("guilds/%s/ranks/%s", guildID, url.PathEscape(name)), nil)
	return err
}

func (c *Client) RemoveRecord(ctx context.Context, guildID string, recordID int) error {
	_, err := c.do(ctx, http.MethodDelete, c.apiURL, fmt.Sprintf("guilds/%s/records/id/%d", guildID, recordID), nil)
	return err
}

// AddTeammate adds a user to the team of a boss's #1 record.
func (c *Client) AddTeammate(ctx context.Context, guildID, boss, userID string) error {
	return c.teammate(ctx, http.MethodPost, guildID, boss, userID)
}

// RemoveTeammate removes a user from the team of a boss's #1 record.
func (c *Client) RemoveTeammate(ctx context.Context, guildID, boss, userID string) error {
	return c.teammate(ctx, http.MethodDelete, guildID, boss, userID)
}

func (c *Client) teammate(ctx context.Context, method, guildID, boss, userID string) error {
	body := map[string]string{"guild_id": guildID, "user_id": userID}
	_, err := c.doJSON(ctx, method, fmt.Sprintf("guilds/%s/teams/boss/%s", guildID, url.PathEscape(boss)), body, nil)
	return err
}
