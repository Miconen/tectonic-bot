package reply

import (
	"context"
	"errors"

	"github.com/Miconen/tectonic-bot/go/internal/logging"
	"github.com/Miconen/tectonic-bot/go/internal/str"
	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
)

// UserError is an error whose message is meant for the user as-is (e.g.
// "you must use this in a server"). The error middleware replies with it
// ephemerally and doesn't log it as a failure.
type UserError string

func (e UserError) Error() string { return string(e) }

type withOverrides struct {
	err error
	o   str.Overrides
}

func (w withOverrides) Error() string { return w.err.Error() }
func (w withOverrides) Unwrap() error { return w.err }

// WithOverrides attaches context-specific messages to an API error, replacing
// the `category` argument of replyApiError/getApiErrorMessage in TS.
func WithOverrides(err error, o str.Overrides) error {
	if err == nil {
		return nil
	}
	return withOverrides{err: err, o: o}
}

// MessageFor builds the user-facing message for any error. The lookup order
// matches constructMessage in errors/api/resolver.ts: contextual override,
// then the standard APIErrors entry, then the API's own message.
func MessageFor(ctx context.Context, err error) string {
	var userErr UserError
	if errors.As(err, &userErr) {
		return string(userErr)
	}

	msg := str.InternalError
	var apiErr *tectonic.APIError
	if errors.As(err, &apiErr) {
		msg = apiErr.Message
		if s, ok := str.APIErrors[apiErr.Code]; ok {
			msg = s
		}
		var w withOverrides
		if errors.As(err, &w) {
			if s, ok := w.o[apiErr.Code]; ok {
				msg = s
			}
		}
	}

	return msg + "\n-# Error ID: " + logging.CorrelationID(ctx)
}
