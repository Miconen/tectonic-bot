// Package logging carries per-interaction context (request ID, user, guild,
// command) through context.Context, the Go equivalent of the TS bot's
// AsyncLocalStorage. Every line logged with Logger(ctx) carries it, so one
// search finds everything an interaction did.
package logging

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"log/slog"
)

type (
	idKey    struct{}
	actorKey struct{}
	attrsKey struct{}
)

// WithCorrelationID returns a context carrying a fresh request ID and the ID
// itself. Used for work that doesn't start from an interaction.
func WithCorrelationID(ctx context.Context) (context.Context, string) {
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	id := hex.EncodeToString(b)
	return WithID(ctx, id), id
}

// WithID returns a context carrying the given request ID. Interactions use
// their interaction ID, which is also the Error ID users see.
func WithID(ctx context.Context, id string) context.Context {
	return context.WithValue(ctx, idKey{}, id)
}

// CorrelationID returns the context's request ID, or "" if none.
func CorrelationID(ctx context.Context) string {
	id, _ := ctx.Value(idKey{}).(string)
	return id
}

// WithActor records the Discord user behind the work. It's logged as user_id
// and sent to the API as X-Actor-ID, so one member can be followed across
// both services.
func WithActor(ctx context.Context, userID string) context.Context {
	return With(context.WithValue(ctx, actorKey{}, userID), "user_id", userID)
}

// Actor returns the context's user ID, or "".
func Actor(ctx context.Context) string {
	id, _ := ctx.Value(actorKey{}).(string)
	return id
}

// With adds attributes to every later log line from this context.
func With(ctx context.Context, args ...any) context.Context {
	prev, _ := ctx.Value(attrsKey{}).([]any)
	all := append(append([]any(nil), prev...), args...)
	return context.WithValue(ctx, attrsKey{}, all)
}

// Logger returns the default logger tagged with the context's request ID and
// attributes. The key matches the API's request_id, so one search covers the
// bot and the API.
func Logger(ctx context.Context) *slog.Logger {
	l := slog.Default()
	if id := CorrelationID(ctx); id != "" {
		l = l.With("request_id", id)
	}
	if attrs, _ := ctx.Value(attrsKey{}).([]any); len(attrs) > 0 {
		l = l.With(attrs...)
	}
	return l
}
