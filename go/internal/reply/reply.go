// Package reply sends interaction responses, replacing replyHandler.ts.
//
// It remembers per interaction whether the response was deferred or already
// sent, so callers (and the error middleware) can always just call Text or
// Ephemeral without checking interaction state themselves.
package reply

import (
	"context"
	"errors"
	"strings"
	"sync"

	"github.com/disgoorg/disgo/bot"
	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/rest"
	"github.com/disgoorg/snowflake/v2"

	"github.com/Miconen/tectonic-bot/go/internal/logging"
)

// CharacterLimit is Discord's message content limit.
const CharacterLimit = 2000

// Event is satisfied by both *handler.CommandEvent and *handler.InteractionEvent.
type Event interface {
	ApplicationID() snowflake.ID
	Token() string
	Client() *bot.Client
	CreateMessage(discord.MessageCreate, ...rest.RequestOpt) error
	DeferCreateMessage(bool, ...rest.RequestOpt) error
}

type state struct {
	mu       sync.Mutex
	deferred bool
	replied  bool
}

type stateKey struct{}

// Track returns a context that remembers this interaction's response state.
// The router middleware calls it once per interaction.
func Track(ctx context.Context) context.Context {
	return context.WithValue(ctx, stateKey{}, &state{})
}

func stateFrom(ctx context.Context) *state {
	if s, ok := ctx.Value(stateKey{}).(*state); ok {
		return s
	}
	return &state{}
}

// Defer acknowledges the interaction ("bot is thinking...").
func Defer(ctx context.Context, e Event, ephemeral bool) error {
	s := stateFrom(ctx)
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.deferred || s.replied {
		return nil
	}
	if err := e.DeferCreateMessage(ephemeral); err != nil {
		return ignoreExpired(ctx, err)
	}
	s.deferred = true
	return nil
}

// Text sends a public reply.
func Text(ctx context.Context, e Event, msg string) error {
	return send(ctx, e, msg, false)
}

// Ephemeral sends a reply only the invoking user sees.
func Ephemeral(ctx context.Context, e Event, msg string) error {
	return send(ctx, e, msg, true)
}

func send(ctx context.Context, e Event, msg string, ephemeral bool) error {
	s := stateFrom(ctx)
	s.mu.Lock()
	defer s.mu.Unlock()

	var flags discord.MessageFlags
	if ephemeral {
		flags = discord.MessageFlagEphemeral
	}

	for _, chunk := range Split(msg, CharacterLimit) {
		var err error
		switch {
		case s.deferred && !s.replied:
			_, err = e.Client().Rest.UpdateInteractionResponse(e.ApplicationID(), e.Token(),
				discord.NewMessageUpdate().WithContent(chunk))
		case !s.replied:
			err = e.CreateMessage(discord.MessageCreate{Content: chunk, Flags: flags})
		default:
			_, err = e.Client().Rest.CreateFollowupMessage(e.ApplicationID(), e.Token(),
				discord.MessageCreate{Content: chunk, Flags: flags})
		}
		if err != nil {
			return ignoreExpired(ctx, err)
		}
		s.replied = true
	}
	return nil
}

// ignoreExpired swallows Discord error 10062 (Unknown interaction), which
// means the token expired before we answered.
func ignoreExpired(ctx context.Context, err error) error {
	var restErr *rest.Error
	if errors.As(err, &restErr) && restErr.Code == rest.JSONErrorCodeUnknownInteraction {
		logging.Logger(ctx).Warn("Interaction expired before reply could be sent (10062)")
		return nil
	}
	return err
}

// Split breaks a message into chunks of at most limit characters, preferring
// to cut at the last newline (splitMessage in TS).
func Split(msg string, limit int) []string {
	r := []rune(msg)
	if len(r) < limit {
		return []string{msg}
	}

	var chunks []string
	for len(r) > limit {
		cut := lastIndex(r[:limit], '\n')
		if cut == -1 {
			cut = limit
		}
		chunks = append(chunks, string(r[:cut]))
		r = []rune(strings.TrimSpace(string(r[cut:])))
	}
	return append(chunks, string(r))
}

func lastIndex(r []rune, c rune) int {
	for i := len(r) - 1; i >= 0; i-- {
		if r[i] == c {
			return i
		}
	}
	return -1
}
