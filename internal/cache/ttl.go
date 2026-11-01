// Package cache is a small generic TTL cache with a loader, replacing the TS
// bot's TTLCache plus the populate-then-get code around each use.
package cache

import (
	"context"
	"sync"
	"time"
)

// TTL caches values per key for a fixed time. A zero TTL never expires.
type TTL[K comparable, V any] struct {
	ttl  time.Duration
	load func(context.Context, K) (V, error)

	mu      sync.Mutex
	entries map[K]entry[V]
}

type entry[V any] struct {
	value   V
	expires time.Time
}

func New[K comparable, V any](ttl time.Duration, load func(context.Context, K) (V, error)) *TTL[K, V] {
	return &TTL[K, V]{ttl: ttl, load: load, entries: map[K]entry[V]{}}
}

// Get returns the cached value or loads it. Load errors are not cached.
func (c *TTL[K, V]) Get(ctx context.Context, key K) (V, error) {
	c.mu.Lock()
	e, ok := c.entries[key]
	c.mu.Unlock()
	if ok && (c.ttl == 0 || time.Now().Before(e.expires)) {
		return e.value, nil
	}

	v, err := c.load(ctx, key)
	if err != nil {
		var zero V
		return zero, err
	}
	c.mu.Lock()
	c.entries[key] = entry[V]{value: v, expires: time.Now().Add(c.ttl)}
	c.mu.Unlock()
	return v, nil
}

// Invalidate drops a key so the next Get reloads it.
func (c *TTL[K, V]) Invalidate(key K) {
	c.mu.Lock()
	delete(c.entries, key)
	c.mu.Unlock()
}
