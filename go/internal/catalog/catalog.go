// Package catalog caches the lists autocomplete and submissions look things up
// in: achievements, each guild's combat achievements, events and users.
package catalog

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/disgoorg/disgo/discord"

	"github.com/Miconen/tectonic-bot/go/internal/cache"
	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
)

type Catalog struct {
	Achievements []tectonic.Achievement

	cas    *cache.TTL[string, []tectonic.CombatAchievement]
	events *cache.TTL[string, []tectonic.Event]
	users  *cache.TTL[userKey, *tectonic.DetailedUser]
}

type userKey struct{ guild, user string }

// New loads the global achievement list (like the TS bot, startup fails
// without it) and sets up the per-guild caches.
func New(ctx context.Context, api *tectonic.Client) (*Catalog, error) {
	achievements, err := api.GetAchievements(ctx)
	if err != nil {
		return nil, err
	}
	return &Catalog{
		Achievements: achievements,
		cas: cache.New(30*time.Second, func(ctx context.Context, guildID string) ([]tectonic.CombatAchievement, error) {
			return api.GetGuildCombatAchievements(ctx, guildID)
		}),
		events: cache.New(30*time.Second, func(ctx context.Context, guildID string) ([]tectonic.Event, error) {
			return api.GetEvents(ctx, guildID)
		}),
		users: cache.New(30*time.Second, func(ctx context.Context, k userKey) (*tectonic.DetailedUser, error) {
			u, err := api.GetUser(ctx, k.guild, tectonic.ByUserID(k.user))
			if errors.Is(err, tectonic.ErrNotFound) {
				return nil, nil
			}
			return u, err
		}),
	}, nil
}

// CombatAchievements returns the guild's CAs (cached for 30s).
func (c *Catalog) CombatAchievements(ctx context.Context, guildID string) ([]tectonic.CombatAchievement, error) {
	return c.cas.Get(ctx, guildID)
}

// Events returns the guild's events (cached for 30s).
func (c *Catalog) Events(ctx context.Context, guildID string) ([]tectonic.Event, error) {
	return c.events.Get(ctx, guildID)
}

// EventsChanged drops the cached events after one was added or changed.
func (c *Catalog) EventsChanged(guildID string) { c.events.Invalidate(guildID) }

// CombatAchievement finds one CA by name.
func (c *Catalog) CombatAchievement(ctx context.Context, guildID, name string) (tectonic.CombatAchievement, bool, error) {
	cas, err := c.CombatAchievements(ctx, guildID)
	if err != nil {
		return tectonic.CombatAchievement{}, false, err
	}
	for _, ca := range cas {
		if ca.Name == name {
			return ca, true, nil
		}
	}
	return tectonic.CombatAchievement{}, false, nil
}

// User returns a user for autocomplete (cached for 30s; nil if not activated).
func (c *Catalog) User(ctx context.Context, guildID, userID string) (*tectonic.DetailedUser, error) {
	return c.users.Get(ctx, userKey{guildID, userID})
}

// UserChanged drops a cached user after their data changed.
func (c *Catalog) UserChanged(guildID, userID string) {
	c.users.Invalidate(userKey{guildID, userID})
}

// HasAchievement reports whether u has the named achievement.
func HasAchievement(u *tectonic.DetailedUser, name string) bool {
	if u == nil {
		return false
	}
	for _, a := range u.Achievements {
		if a.Name == name {
			return true
		}
	}
	return false
}

// HasCombatAchievement reports whether u has completed the named CA.
func HasCombatAchievement(u *tectonic.DetailedUser, name string) bool {
	if u == nil {
		return false
	}
	for _, ca := range u.CombatAchievements {
		if ca.Name == name {
			return true
		}
	}
	return false
}

// Choices turns items into at most 25 autocomplete choices whose name contains
// what the user typed.
func Choices[T any](items []T, typed string, name func(T) string, value func(T) string) []discord.AutocompleteChoice {
	typed = strings.ToLower(strings.TrimSpace(typed))
	out := make([]discord.AutocompleteChoice, 0, 25)
	for _, it := range items {
		n := name(it)
		if typed != "" && !strings.Contains(strings.ToLower(n), typed) {
			continue
		}
		out = append(out, discord.AutocompleteChoiceString{Name: n, Value: value(it)})
		if len(out) == 25 {
			break
		}
	}
	return out
}
