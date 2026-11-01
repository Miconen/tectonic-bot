package cache

import (
	"context"
	"errors"
	"testing"
	"time"
)

func TestTTL(t *testing.T) {
	calls := 0
	fail := false
	c := New(50*time.Millisecond, func(_ context.Context, k string) (int, error) {
		calls++
		if fail {
			return 0, errors.New("boom")
		}
		return len(k) + calls, nil
	})
	ctx := context.Background()

	a, _ := c.Get(ctx, "ab")
	b, _ := c.Get(ctx, "ab")
	if a != b || calls != 1 {
		t.Fatalf("expected a cached value, got %d %d after %d calls", a, b, calls)
	}

	c.Invalidate("ab")
	c.Get(ctx, "ab")
	if calls != 2 {
		t.Errorf("invalidate should reload, calls=%d", calls)
	}

	time.Sleep(60 * time.Millisecond)
	fail = true
	if _, err := c.Get(ctx, "ab"); err == nil {
		t.Error("expired entry should reload and surface the error")
	}
	fail = false
	if _, err := c.Get(ctx, "ab"); err != nil || calls != 4 {
		t.Errorf("errors must not be cached: %v calls=%d", err, calls)
	}
}
