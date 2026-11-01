// Package wom reads competitions from Wise Old Man. The bot needs them for
// team name autocomplete and /bingo setup; the API handles everything else.
package wom

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"slices"
	"time"

	"github.com/Miconen/tectonic-bot/internal/cache"
)

const baseURL = "https://api.wiseoldman.net/v2/"

type Client struct {
	http         *http.Client
	base         string
	competitions *cache.TTL[int, Competition]
}

// Competition is the part of a WOM competition the bot uses.
type Competition struct {
	Title string
	// Teams maps team names to their players' RSNs, in WOM's order.
	Teams     map[string][]string
	TeamNames []string // sorted
}

func New() *Client {
	c := &Client{http: &http.Client{Timeout: 10 * time.Second}, base: baseURL}
	c.competitions = cache.New(5*time.Minute, c.fetch)
	return c
}

// Competition returns a competition (cached for 5 minutes, since autocomplete
// asks on every keystroke).
func (c *Client) Competition(ctx context.Context, id int) (Competition, error) {
	return c.competitions.Get(ctx, id)
}

// Teams returns a competition's team names.
func (c *Client) Teams(ctx context.Context, id int) ([]string, error) {
	comp, err := c.Competition(ctx, id)
	return comp.TeamNames, err
}

// ErrNotFound means WOM has no competition with that ID.
var ErrNotFound = errors.New("wise old man: competition not found")

func (c *Client) fetch(ctx context.Context, id int) (Competition, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%scompetitions/%d", c.base, id), nil)
	if err != nil {
		return Competition{}, err
	}
	res, err := c.http.Do(req)
	if err != nil {
		return Competition{}, err
	}
	defer res.Body.Close()
	if res.StatusCode == http.StatusNotFound {
		return Competition{}, ErrNotFound
	}
	if res.StatusCode != http.StatusOK {
		return Competition{}, fmt.Errorf("wise old man: competition %d: status %d", id, res.StatusCode)
	}

	var body struct {
		Title          string `json:"title"`
		Participations []struct {
			TeamName *string `json:"teamName"`
			Player   struct {
				DisplayName string `json:"displayName"`
			} `json:"player"`
		} `json:"participations"`
	}
	if err := json.NewDecoder(res.Body).Decode(&body); err != nil {
		return Competition{}, fmt.Errorf("wise old man: decode competition %d: %w", id, err)
	}

	comp := Competition{Title: body.Title, Teams: map[string][]string{}}
	for _, p := range body.Participations {
		if p.TeamName == nil || *p.TeamName == "" {
			continue
		}
		team := *p.TeamName
		if _, ok := comp.Teams[team]; !ok {
			comp.TeamNames = append(comp.TeamNames, team)
		}
		comp.Teams[team] = append(comp.Teams[team], p.Player.DisplayName)
	}
	slices.Sort(comp.TeamNames)
	return comp, nil
}
