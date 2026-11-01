// Package pointsrc caches each guild's point sources (utils/pointSources.ts).
package pointsrc

import (
	"context"
	"fmt"
	"strings"
	"sync"

	"github.com/disgoorg/disgo/discord"

	"github.com/Miconen/tectonic-bot/internal/tectonic"
)

// Cache keeps point sources for the bot's lifetime, like the TS bot.
type Cache struct {
	api *tectonic.Client

	mu      sync.Mutex
	byGuild map[string][]tectonic.PointSource
}

func New(api *tectonic.Client) *Cache {
	return &Cache{api: api, byGuild: map[string][]tectonic.PointSource{}}
}

func (c *Cache) List(ctx context.Context, guildID string) ([]tectonic.PointSource, error) {
	c.mu.Lock()
	s, ok := c.byGuild[guildID]
	c.mu.Unlock()
	if ok {
		return s, nil
	}

	s, err := c.api.GetGuildPointSources(ctx, guildID)
	if err != nil {
		return nil, err
	}
	c.mu.Lock()
	c.byGuild[guildID] = s
	c.mu.Unlock()
	return s, nil
}

// Resolved is a point source with the guild multiplier applied.
type Resolved struct {
	Source string
	Name   string
	Points int
}

// Resolve looks up a source and applies the guild's multiplier. Unlike the TS
// getPoints, a failed lookup is an error, never a silent 0 (#155).
func (c *Cache) Resolve(ctx context.Context, guild tectonic.Guild, source string) (Resolved, error) {
	sources, err := c.List(ctx, guild.GuildID)
	if err != nil {
		return Resolved{}, err
	}
	for _, s := range sources {
		if s.Source == source {
			multiplier := guild.Multiplier
			if multiplier == 0 {
				multiplier = 1
			}
			return Resolved{Source: s.Source, Name: s.Name, Points: s.Points * multiplier}, nil
		}
	}
	return Resolved{}, &tectonic.APIError{Status: 404, Code: tectonic.CodePointSourceNotFound, Message: fmt.Sprintf("Point source %s not found", source)}
}

// Choices returns up to 25 autocomplete choices matching typed.
func (c *Cache) Choices(ctx context.Context, guildID, typed string) ([]discord.AutocompleteChoice, error) {
	sources, err := c.List(ctx, guildID)
	if err != nil {
		return nil, err
	}
	typed = strings.ToLower(typed)
	choices := make([]discord.AutocompleteChoice, 0, 25)
	for _, s := range sources {
		name := fmt.Sprintf("%s | %d points", s.Name, s.Points)
		if typed != "" && !strings.Contains(strings.ToLower(name), typed) {
			continue
		}
		choices = append(choices, discord.AutocompleteChoiceString{Name: name, Value: s.Source})
		if len(choices) == 25 {
			break
		}
	}
	return choices, nil
}
