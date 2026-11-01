// Package approval is the moderator approval flow for PB (and later split,
// CA and achievement) requests, replacing src/commands/requests.
//
// A command builds a Request and calls Post. Moderators approve or deny it
// with the buttons or /accept and /deny. Pending requests live in memory, as
// in the TS bot, so they're lost on restart.
package approval

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/disgoorg/disgo/bot"
	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/handler"
	"github.com/disgoorg/disgo/rest"
	"github.com/disgoorg/snowflake/v2"

	"github.com/Miconen/tectonic-bot/internal/logging"
	"github.com/Miconen/tectonic-bot/internal/mw"
	"github.com/Miconen/tectonic-bot/internal/opt"
	"github.com/Miconen/tectonic-bot/internal/reply"
	"github.com/Miconen/tectonic-bot/internal/str"
	"github.com/Miconen/tectonic-bot/internal/tectonic"
)

// Request is one kind of approvable submission.
type Request interface {
	// Kind is a short name for logs, e.g. "pb".
	Kind() string
	// Label describes the request in /accept and /deny autocomplete.
	Label() string
	// Accept applies the request. Its message replaces the submitter's
	// message. On error the request stays pending so it can be retried (#153).
	Accept(ctx context.Context, env Env) (Result, error)
	// DenyMessage replaces the submitter's message on deny.
	DenyMessage() string
}

// Result of an accepted request.
type Result struct {
	Message string
	// Warnings go only to the moderator, e.g. "embed update failed".
	Warnings []string
}

// Env is what Accept gets to work with.
type Env struct {
	Client  *bot.Client
	GuildID snowflake.ID
}

type pending struct {
	id        string
	req       Request
	guildID   snowflake.ID
	created   time.Time
	channelID snowflake.ID
	messageID snowflake.ID
	// Zero when buttons are on the submitter's message.
	modChannelID snowflake.ID
	modMessageID snowflake.ID
	busy         bool
}

// Service holds pending requests.
type Service struct {
	mu      sync.Mutex
	pending map[string]*pending
	http    *http.Client
}

func New() *Service {
	return &Service{pending: map[string]*pending{}, http: &http.Client{Timeout: 30 * time.Second}}
}

// Submission is what a command posts for approval.
type Submission struct {
	Content    string
	Screenshot discord.Attachment
	Request    Request
}

// Post replaces the deferred reply with the request and adds Accept/Deny
// buttons, in the guild's mod channel when one is set. The caller must have
// fetched guild successfully: unlike the TS bot, a failed config lookup never
// falls back to public buttons (#157).
func (s *Service) Post(ctx context.Context, e *handler.CommandEvent, guild tectonic.Guild, sub Submission) error {
	shot, err := s.download(ctx, sub.Screenshot.URL)
	if err != nil {
		logging.Logger(ctx).Warn("download screenshot", "err", err)
		return reply.UserError(str.ScreenshotFailed)
	}
	file := func() *discord.File {
		return discord.NewFile(sub.Screenshot.Filename, "", strings.NewReader(string(shot)))
	}

	p := &pending{
		id:        e.ID().String(),
		req:       sub.Request,
		guildID:   *e.GuildID(),
		created:   time.Now(),
		channelID: e.Channel().ID(),
	}
	buttons := discord.NewActionRow(
		discord.NewSuccessButton("Accept", "/request/accept/"+p.id),
		discord.NewDangerButton("Deny", "/request/deny/"+p.id),
	)
	rst := e.Client().Rest

	var modChannel snowflake.ID
	if guild.ModChannelID != nil {
		modChannel, _ = snowflake.Parse(*guild.ModChannelID)
	}

	if modChannel != 0 {
		modMsg, err := rst.CreateMessage(modChannel, discord.MessageCreate{
			Content:    sub.Content,
			Components: []discord.LayoutComponent{buttons},
			Files:      []*discord.File{file()},
		}, rest.WithCtx(ctx))
		if err == nil {
			p.modChannelID, p.modMessageID = modChannel, modMsg.ID
		} else {
			logging.Logger(ctx).Warn("Failed to send to mod channel, buttons on user message", "err", err)
		}
	}

	update := discord.NewMessageUpdate().WithContent(sub.Content).WithFiles(file())
	if p.modMessageID == 0 {
		update = update.WithComponents(buttons)
	}
	msg, err := rst.UpdateInteractionResponse(e.ApplicationID(), e.Token(), update, rest.WithCtx(ctx))
	if err != nil {
		if p.modMessageID != 0 {
			_ = rst.DeleteMessage(p.modChannelID, p.modMessageID)
		}
		return err
	}
	p.messageID = msg.ID

	s.mu.Lock()
	s.pending[p.id] = p
	s.mu.Unlock()
	logging.Logger(ctx).Info("Request posted", "request", p.id, "kind", p.req.Kind(), "label", p.req.Label())
	return nil
}

func (s *Service) download(ctx context.Context, url string) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, err
	}
	res, err := s.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("status %d", res.StatusCode)
	}
	return io.ReadAll(io.LimitReader(res.Body, 25<<20))
}

// claim marks a request as being handled so two moderators can't approve it
// twice at the same time.
func (s *Service) claim(id string, guildID snowflake.ID) (*pending, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	p, ok := s.pending[id]
	if !ok || p.guildID != guildID {
		return nil, reply.SystemError(str.RequestNotFound)
	}
	if p.busy {
		return nil, reply.UserError(str.RequestInProcess)
	}
	p.busy = true
	return p, nil
}

func (s *Service) release(p *pending, done bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if done {
		delete(s.pending, p.id)
	} else {
		p.busy = false
	}
}

// Register adds the buttons and /accept, /deny.
func (s *Service) Register(r handler.Router) {
	r.Group(func(r handler.Router) {
		r.Use(mw.RequireAdmin)

		r.ButtonComponent("/request/accept/{id}", func(_ discord.ButtonInteractionData, e *handler.ComponentEvent) error {
			return s.accept(e.Ctx, e, e.Vars["id"])
		})
		r.ButtonComponent("/request/deny/{id}", func(_ discord.ButtonInteractionData, e *handler.ComponentEvent) error {
			return s.deny(e.Ctx, e, e.Vars["id"])
		})
		r.SlashCommand("/accept", func(data discord.SlashCommandInteractionData, e *handler.CommandEvent) error {
			return s.accept(e.Ctx, e, data.String("id"))
		})
		r.SlashCommand("/deny", func(data discord.SlashCommandInteractionData, e *handler.CommandEvent) error {
			return s.deny(e.Ctx, e, data.String("id"))
		})
		r.Autocomplete("/accept", s.autocomplete)
		r.Autocomplete("/deny", s.autocomplete)
	})
}

// Commands are the slash command definitions to sync.
var Commands = []discord.ApplicationCommandCreate{
	idCommand("accept", "Accept a pending request by id"),
	idCommand("deny", "Deny a pending request by id"),
}

func idCommand(name, desc string) discord.SlashCommandCreate {
	return discord.SlashCommandCreate{
		Name:        name,
		Description: desc,
		Options: []discord.ApplicationCommandOption{
			opt.Autocomplete("id", "Id of the pending request"),
		},
	}
}

type event interface {
	reply.Event
	GuildID() *snowflake.ID
}

func (s *Service) accept(ctx context.Context, e event, id string) error {
	p, err := s.claim(id, *e.GuildID())
	if err != nil {
		return err
	}
	log := logging.Logger(ctx).With("request", id, "kind", p.req.Kind(), "label", p.req.Label())
	log.Info("Accepting request")

	if err := reply.Defer(ctx, e, true); err != nil {
		s.release(p, false)
		return err
	}

	res, err := p.req.Accept(ctx, Env{Client: e.Client(), GuildID: p.guildID})
	if err != nil {
		// Keep it pending (and its mod message) so it can be retried.
		s.release(p, false)
		log.Error("Request approval failed", "err", err)
		return reply.Ephemeral(ctx, e, str.RequestApproveFailed(reply.MessageFor(ctx, err)))
	}

	s.finish(ctx, e.Client(), p, res.Message)
	s.release(p, true)
	log.Info("Request accepted")

	msg := str.RequestApproved(p.link())
	for _, w := range res.Warnings {
		msg += "\n" + w
	}
	return reply.Ephemeral(ctx, e, msg)
}

func (s *Service) deny(ctx context.Context, e event, id string) error {
	p, err := s.claim(id, *e.GuildID())
	if err != nil {
		return err
	}
	logging.Logger(ctx).Info("Denying request", "request", id, "kind", p.req.Kind(), "label", p.req.Label())

	if err := reply.Defer(ctx, e, true); err != nil {
		s.release(p, false)
		return err
	}
	s.finish(ctx, e.Client(), p, p.req.DenyMessage())
	s.release(p, true)
	return reply.Ephemeral(ctx, e, str.RequestDenied(p.link()))
}

// finish replaces the submitter's message (keeping the screenshot) and removes
// the mod channel copy. Failures here are logged, not fatal: the request
// itself is already handled.
func (s *Service) finish(ctx context.Context, client *bot.Client, p *pending, content string) {
	log := logging.Logger(ctx)
	_, err := client.Rest.UpdateMessage(p.channelID, p.messageID,
		discord.NewMessageUpdate().WithContent(content).ClearComponents(), rest.WithCtx(ctx))
	if err != nil {
		log.Warn("Failed to edit request message", "err", err)
	}
	if p.modMessageID != 0 {
		if err := client.Rest.DeleteMessage(p.modChannelID, p.modMessageID, rest.WithCtx(ctx)); err != nil {
			log.Warn("Failed to delete mod message", "err", err)
		}
	}
}

func (p *pending) link() string {
	return fmt.Sprintf("https://discord.com/channels/%s/%s/%s", p.guildID, p.channelID, p.messageID)
}

func (s *Service) autocomplete(e *handler.AutocompleteEvent) error {
	guildID := *e.GuildID()

	s.mu.Lock()
	var list []*pending
	for _, p := range s.pending {
		if p.guildID == guildID { // the TS bot listed every guild's requests
			list = append(list, p)
		}
	}
	s.mu.Unlock()

	sort.Slice(list, func(i, j int) bool { return list[i].created.Before(list[j].created) })

	typed := strings.ToLower(e.Data.Focused().String())
	choices := make([]discord.AutocompleteChoice, 0, 25)
	for _, p := range list {
		name := fmt.Sprintf("%s (%s)", p.req.Label(), TimeAgo(time.Since(p.created)))
		if typed != "" && !strings.Contains(strings.ToLower(name), typed) {
			continue
		}
		choices = append(choices, discord.AutocompleteChoiceString{Name: truncate(name, 100), Value: p.id})
		if len(choices) == 25 {
			break
		}
	}
	return e.AutocompleteResult(choices)
}

func truncate(s string, n int) string {
	r := []rune(s)
	if len(r) <= n {
		return s
	}
	return string(r[:n-1]) + "…"
}

// TimeAgo formats a duration like formatTimeAgo in TS.
func TimeAgo(d time.Duration) string {
	mins := int(d.Minutes())
	h, m := mins/60, mins%60
	unit := func(n int, word string) string {
		if n == 1 {
			return "1 " + word
		}
		return fmt.Sprintf("%d %ss", n, word)
	}
	switch {
	case h == 0 && m == 0:
		return "just now"
	case h == 0:
		return unit(m, "minute") + " ago"
	case m == 0:
		return unit(h, "hour") + " ago"
	default:
		return unit(h, "hour") + " and " + unit(m, "minute") + " ago"
	}
}
