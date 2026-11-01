// Package wom reads competitions from Wise Old Man, which the bot only needs
// for the team name autocomplete (the API handles everything else).
package wom

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"slices"
	"time"

	"github.com/Miconen/tectonic-bot/go/internal/cache"
)

const baseURL = "https://api.wiseoldman.net/v2/"

type Client struct {
	http  *http.Client
	base  string
	teams *cache.TTL[int, []string]
}

func New() *Client {
	c := &Client{http: &http.Client{Timeout: 10 * time.Second}, base: baseURL}
	c.teams = cache.New(5*time.Minute, c.fetchTeams)
	return c
}

// Teams returns a competition's team names (cached for 5 minutes, since
// autocomplete asks on every keystroke).
func (c *Client) Teams(ctx context.Context, competitionID int) ([]string, error) {
	return c.teams.Get(ctx, competitionID)
}

func (c *Client) fetchTeams(ctx context.Context, id int) ([]string, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%scompetitions/%d", c.base, id), nil)
	if err != nil {
		return nil, err
	}
	res, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("wise old man: competition %d: status %d", id, res.StatusCode)
	}

	var body struct {
		Participations []struct {
			TeamName *string `json:"teamName"`
		} `json:"participations"`
	}
	if err := json.NewDecoder(res.Body).Decode(&body); err != nil {
		return nil, fmt.Errorf("wise old man: decode competition %d: %w", id, err)
	}
	var teams []string
	for _, p := range body.Participations {
		if p.TeamName != nil && *p.TeamName != "" && !slices.Contains(teams, *p.TeamName) {
			teams = append(teams, *p.TeamName)
		}
	}
	slices.Sort(teams)
	return teams, nil
}
