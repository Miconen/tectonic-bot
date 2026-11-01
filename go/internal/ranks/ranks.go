// Package ranks ports src/ranks: tier math, the 30s guild rank cache and
// rank role syncing.
package ranks

import (
	"context"
	"sync"
	"time"

	"github.com/Miconen/tectonic-bot/go/internal/logging"
	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
)

type Rank = tectonic.GuildRank

// TierFor returns the highest tier whose MinPoints <= points, or nil.
func TierFor(points int, ranks []Rank) *Rank {
	var best *Rank
	for i := range ranks {
		r := &ranks[i]
		if points >= r.MinPoints && (best == nil || r.MinPoints > best.MinPoints) {
			best = r
		}
	}
	return best
}

// NextTier returns the lowest tier with MinPoints > points, or nil.
func NextTier(points int, ranks []Rank) *Rank {
	var next *Rank
	for i := range ranks {
		r := &ranks[i]
		if r.MinPoints > points && (next == nil || r.MinPoints < next.MinPoints) {
			next = r
		}
	}
	return next
}

// PointsToNext returns the points still needed for the next tier.
func PointsToNext(points int, ranks []Rank) (int, bool) {
	next := NextTier(points, ranks)
	if next == nil {
		return 0, false
	}
	return next.MinPoints - points, true
}

// Icon returns the rank's icon or "" (handles nil ranks and nil icons).
func Icon(r *Rank) string {
	if r == nil || r.Icon == nil {
		return ""
	}
	return *r.Icon
}

type Transition struct {
	Old, New *Rank
	Changed  bool
}

func GetTransition(ranks []Rank, oldPoints, newPoints int) Transition {
	o, n := TierFor(oldPoints, ranks), TierFor(newPoints, ranks)
	return Transition{Old: o, New: n, Changed: name(o) != name(n)}
}

func name(r *Rank) string {
	if r == nil {
		return ""
	}
	return r.Name
}

// Cache holds each guild's ranks for 30 seconds (GuildRanks TTLCache in TS).
type Cache struct {
	api *tectonic.Client
	ttl time.Duration

	mu      sync.Mutex
	entries map[string]cacheEntry
}

type cacheEntry struct {
	ranks   []Rank
	expires time.Time
}

func NewCache(api *tectonic.Client) *Cache {
	return &Cache{api: api, ttl: 30 * time.Second, entries: map[string]cacheEntry{}}
}

// Get returns the guild's ranks, or an empty list if the API call fails (the
// TS bot logs and carries on in that case too).
func (c *Cache) Get(ctx context.Context, guildID string) []Rank {
	c.mu.Lock()
	if e, ok := c.entries[guildID]; ok && time.Now().Before(e.expires) {
		c.mu.Unlock()
		return e.ranks
	}
	c.mu.Unlock()

	ranks, err := c.api.GetGuildRanks(ctx, guildID)
	if err != nil {
		logging.Logger(ctx).Error("Error fetching guild ranks", "err", err)
		return nil
	}

	c.mu.Lock()
	c.entries[guildID] = cacheEntry{ranks: ranks, expires: time.Now().Add(c.ttl)}
	c.mu.Unlock()
	return ranks
}

// Invalidate drops a guild's cached ranks.
func (c *Cache) Invalidate(guildID string) {
	c.mu.Lock()
	delete(c.entries, guildID)
	c.mu.Unlock()
}
