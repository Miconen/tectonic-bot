package reply

import (
	"context"
	"fmt"
	"strings"
	"testing"

	"github.com/Miconen/tectonic-bot/internal/logging"
	"github.com/Miconen/tectonic-bot/internal/str"
	"github.com/Miconen/tectonic-bot/internal/tectonic"
)

func TestMessageFor(t *testing.T) {
	ctx, id := logging.WithCorrelationID(context.Background())
	suffix := "\n-# Error ID: " + id

	userNotFound := &tectonic.APIError{Status: 404, Code: tectonic.CodeUserNotFound, Message: "User not found"}
	rateLimited := &tectonic.APIError{Status: 429, Code: tectonic.CodeAPIRateLimited, Message: "Too many requests to Tectonic API"}

	cases := []struct {
		name string
		err  error
		want string
	}{
		{"api message fallback", userNotFound, "User not found"},
		{"standard message", rateLimited, str.APIErrors[tectonic.CodeAPIRateLimited]},
		{"contextual override", WithOverrides(userNotFound, str.AccountErrors(str.AccountArgs{Username: "Zezima"})), "User **Zezima** is not activated in this server."},
		{"override without args falls through", WithOverrides(userNotFound, str.AccountErrors(str.AccountArgs{})), "User not found"},
		{"override wins over standard", WithOverrides(rateLimited, str.Overrides{tectonic.CodeAPIRateLimited: "slow down"}), "slow down"},
		{"wrapped twice", fmt.Errorf("profile: %w", WithOverrides(userNotFound, str.AccountErrors(str.AccountArgs{Username: "Zezima"}))), "User **Zezima** is not activated in this server."},
		{"non-api error", fmt.Errorf("boom"), str.InternalError},
		{"system error keeps message and gets id", SystemError(str.APIHealth), str.APIHealth},
		{"network error is sanitized", &tectonic.APIError{Status: 500, Code: tectonic.CodeUnknown, Message: "dial tcp 10.0.0.5:8080: connection refused"}, str.UnexpectedAPIError},
		{"validation error is sanitized", &tectonic.APIError{Status: 422, Code: tectonic.CodeUnknown, Message: "expected string, got number at body.rsn"}, str.UnexpectedAPIError},
		{"unrecognized code is sanitized", &tectonic.APIError{Status: 400, Code: 4242, Message: "internal detail"}, str.UnexpectedAPIError},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			if got := MessageFor(ctx, c.err); got != c.want+suffix {
				t.Errorf("got %q, want %q", got, c.want+suffix)
			}
		})
	}

	if got := MessageFor(ctx, UserError(str.NoGuild)); got != str.NoGuild {
		t.Errorf("user error: got %q", got)
	}
}

func TestSplit(t *testing.T) {
	short := "hello"
	if got := Split(short, 2000); len(got) != 1 || got[0] != short {
		t.Fatalf("short: %q", got)
	}

	line := strings.Repeat("a", 999)
	msg := line + "\n" + line + "\n" + line // 2999 chars
	got := Split(msg, 2000)
	if len(got) != 2 {
		t.Fatalf("want 2 chunks, got %d", len(got))
	}
	if got[0] != line+"\n"+line || got[1] != line {
		t.Errorf("unexpected chunks: %d/%d chars", len([]rune(got[0])), len([]rune(got[1])))
	}

	noNewline := strings.Repeat("b", 4500)
	got = Split(noNewline, 2000)
	if len(got) != 3 || len(got[0]) != 2000 || len(got[2]) != 500 {
		t.Errorf("hard split: %d chunks", len(got))
	}
	for _, c := range got {
		if len([]rune(c)) > 2000 {
			t.Errorf("chunk over limit: %d", len(c))
		}
	}
}
