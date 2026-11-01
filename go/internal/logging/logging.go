// Package logging carries a per-interaction correlation ID through
// context.Context, the Go equivalent of the TS bot's AsyncLocalStorage.
package logging

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"log/slog"
)

type ctxKey struct{}

// WithCorrelationID returns a context carrying a fresh correlation ID and the
// ID itself.
func WithCorrelationID(ctx context.Context) (context.Context, string) {
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	id := hex.EncodeToString(b)
	return context.WithValue(ctx, ctxKey{}, id), id
}

// CorrelationID returns the context's correlation ID, or "" if none.
func CorrelationID(ctx context.Context) string {
	id, _ := ctx.Value(ctxKey{}).(string)
	return id
}

// Logger returns the default logger tagged with the context's correlation ID.
func Logger(ctx context.Context) *slog.Logger {
	if id := CorrelationID(ctx); id != "" {
		return slog.Default().With("correlation_id", id)
	}
	return slog.Default()
}
