package reply

import (
	"context"
	"errors"

	"github.com/Miconen/tectonic-bot/go/internal/logging"
	"github.com/Miconen/tectonic-bot/go/internal/str"
	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
)

// UserError is a message for the user about their own input or permissions
// (e.g. "you must use this in a server"). It's replied as-is, without an
// Error ID, and isn't logged as a failure.
type UserError string

func (e UserError) Error() string { return string(e) }

// SystemError is an operational failure the user can't fix (API down, missing
// request state...). It's replied with its message plus the Error ID and is
// logged as a failure (#158).
type SystemError string

func (e SystemError) Error() string { return string(e) }

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

// MessageFor builds the user-facing message for any error. For API errors the
// lookup order matches constructMessage in errors/api/resolver.ts: contextual
// override, then the standard APIErrors entry, then the API's own message.
// Every message except a UserError ends with the Error ID.
func MessageFor(ctx context.Context, err error) string {
	var userErr UserError
	if errors.As(err, &userErr) {
		return string(userErr)
	}

	msg := str.InternalError
	var sysErr SystemError
	var apiErr *tectonic.APIError
	switch {
	case errors.As(err, &sysErr):
		msg = string(sysErr)
	case errors.As(err, &apiErr) && !apiErr.Code.Known():
		// Never show raw transport/validation text to users; it's in the logs.
		msg = str.UnexpectedAPIError
	case errors.As(err, &apiErr):
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
