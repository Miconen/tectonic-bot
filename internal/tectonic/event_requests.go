package tectonic

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
)

type Event struct {
	Name           string `json:"name"`
	WomID          string `json:"wom_id"`
	GuildID        string `json:"guild_id"`
	PositionCutoff int    `json:"position_cutoff"`
	Solo           bool   `json:"solo"`
}

type EventParticipation struct {
	UserID    string `json:"user_id"`
	Placement int    `json:"placement"`
}

// EventUpdate changes an event. Nil fields are left as they are.
type EventUpdate struct {
	Name           *string `json:"name,omitempty"`
	PositionCutoff *int    `json:"position_cutoff,omitempty"`
	Solo           *bool   `json:"solo,omitempty"`
}

// NewEvent registers a finished WOM competition. Set Teams for a team event,
// otherwise the top PositionCutoff players win.
type NewEvent struct {
	CompetitionID  int      `json:"event_id"`
	Teams          []string `json:"team_names,omitempty"`
	PositionCutoff int      `json:"position_cutoff,omitempty"`
}

// CompetitionResult is what ending a WOM competition gave out.
type CompetitionResult struct {
	Title            string         `json:"title"`
	ParticipantCount int            `json:"participant_count"`
	Participants     []DetailedUser `json:"participants"`
	Accounts         []RSN          `json:"accounts"`
	Cutoff           int            `json:"cutoff"`
	PointsGiven      int            `json:"points_given"`
}

func (c *Client) GetEvents(ctx context.Context, guildID string) ([]Event, error) {
	return call[[]Event](ctx, c, http.MethodGet, fmt.Sprintf("guilds/%s/events", guildID))
}

func (c *Client) GetEventParticipants(ctx context.Context, guildID, eventID string) ([]EventParticipation, error) {
	var out struct {
		Participations []EventParticipation `json:"participations"`
	}
	_, err := c.do(ctx, http.MethodGet, c.apiURL, fmt.Sprintf("guilds/%s/events/%s", guildID, url.PathEscape(eventID)), &out)
	return out.Participations, err
}

func (c *Client) RegisterEvent(ctx context.Context, guildID string, e NewEvent) error {
	_, err := c.doJSON(ctx, http.MethodPost, fmt.Sprintf("guilds/%s/events", guildID), e, nil)
	return err
}

func (c *Client) RegisterLegacyEvent(ctx context.Context, guildID, name string, userIDs []string) error {
	body := map[string]any{"name": name, "user_ids": userIDs}
	_, err := c.doJSON(ctx, http.MethodPost, fmt.Sprintf("guilds/%s/events/legacy", guildID), body, nil)
	return err
}

func (c *Client) UpdateEvent(ctx context.Context, guildID, eventID string, u EventUpdate) error {
	_, err := c.doJSON(ctx, http.MethodPut, fmt.Sprintf("guilds/%s/events/%s", guildID, url.PathEscape(eventID)), u, nil)
	return err
}

func (c *Client) DeleteEvent(ctx context.Context, guildID, eventID string) error {
	_, err := c.do(ctx, http.MethodDelete, c.apiURL, fmt.Sprintf("guilds/%s/events/%s", guildID, url.PathEscape(eventID)), nil)
	return err
}

// EndCompetition gives points for a WOM competition to everyone at or above
// cutoff.
func (c *Client) EndCompetition(ctx context.Context, guildID string, competitionID, cutoff int) (CompetitionResult, error) {
	return call[CompetitionResult](ctx, c, http.MethodPost, fmt.Sprintf("guilds/%s/wom/competition/%d/cutoff/%d", guildID, competitionID, cutoff))
}
