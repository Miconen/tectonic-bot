// Package event ports /event: event info, removal, settings and registering
// winners from Wise Old Man competitions.
package event

import (
	"context"
	"regexp"
	"strconv"
	"strings"

	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/handler"

	"github.com/Miconen/tectonic-bot/internal/catalog"
	"github.com/Miconen/tectonic-bot/internal/deps"
	"github.com/Miconen/tectonic-bot/internal/members"
	"github.com/Miconen/tectonic-bot/internal/mw"
	. "github.com/Miconen/tectonic-bot/internal/opt"
	"github.com/Miconen/tectonic-bot/internal/reply"
	"github.com/Miconen/tectonic-bot/internal/str"
	"github.com/Miconen/tectonic-bot/internal/tectonic"
)

var Command = discord.SlashCommandCreate{
	Name:        "event",
	Description: "Guild events",
	Options: []discord.ApplicationCommandOption{
		Sub("info", "Get information about a past event",
			Autocomplete("event", "Event to view")),
		Sub("remove", "Remove a stored guild event",
			Autocomplete("event", "Event to remove from the guild")),

		Group("settings", "Manage event settings",
			Sub("rename", "Rename a guild event",
				Autocomplete("event", "Event to rename"),
				StringMax("name", "New name for the event", 64)),
			Sub("cutoff", "Change how many placements of an event win",
				Autocomplete("event", "Event to change the cutoff of"),
				IntRange("cutoff", "Number of winning placements (1-3)", 1, 3)),
			Sub("solo", "Change whether an event is a solo event",
				Autocomplete("event", "Event to change"),
				Bool("solo", "Whether the event is solo")),
		),

		Group("create", "Register guild events",
			Sub("team", "Reward team event winners",
				IntRange("competition", "ID of the WOM competition", 1, -1),
				Autocomplete("team1", str.TeamsDesc(1)),
				Optional(Autocomplete("team2", str.TeamsDesc(2))),
				Optional(Autocomplete("team3", str.TeamsDesc(3)))),
			Sub("individual", "Reward individual event winners",
				IntRange("competition", "ID of the WOM competition", 1, -1),
				Optional(IntRange("top", "How many placements to reward (default 3)", 1, 3))),
			Sub("legacy", "Register a past event by its winners",
				StringMax("name", "Event name (e.g. 'Summer Bingo 2023')", 128),
				String("winners", "Winners as @mentions or user IDs, separated by spaces or commas")),
		),
	},
}

func Register(r handler.Router, d deps.Deps) {
	ev := &events{d: d}
	r.Route("/event", func(r handler.Router) {
		r.SlashCommand("/info", ev.info)
		r.Autocomplete("/info", ev.eventAutocomplete)

		// TS let anyone remove events; everything else here is admin only too.
		r.Group(func(r handler.Router) {
			r.Use(mw.RequireAdmin)
			r.SlashCommand("/remove", ev.remove)
			r.Autocomplete("/remove", ev.eventAutocomplete)

			r.Route("/settings", func(r handler.Router) {
				r.SlashCommand("/rename", ev.rename)
				r.SlashCommand("/cutoff", ev.cutoff)
				r.SlashCommand("/solo", ev.solo)
				for _, sub := range []string{"/rename", "/cutoff", "/solo"} {
					r.Autocomplete(sub, ev.eventAutocomplete)
				}
			})

			r.Route("/create", func(r handler.Router) {
				r.SlashCommand("/team", ev.createTeam)
				r.Autocomplete("/team", ev.teamAutocomplete)
				r.SlashCommand("/individual", ev.createIndividual)
				r.SlashCommand("/legacy", ev.createLegacy)
			})
		})
	})
}

type events struct{ d deps.Deps }

type (
	cmdData  = discord.SlashCommandInteractionData
	cmdEvent = handler.CommandEvent
)

// find looks an event up by WOM ID, which is what autocomplete fills in.
func (ev *events) find(ctx context.Context, guildID, womID string) (tectonic.Event, error) {
	list, err := ev.d.API.GetEvents(ctx, guildID)
	if err != nil {
		return tectonic.Event{}, reply.WithOverrides(err, str.EventErrors(womID, ""))
	}
	for _, e := range list {
		if e.WomID == womID {
			return e, nil
		}
	}
	return tectonic.Event{}, reply.UserError(str.EventNotFound)
}

func (ev *events) info(data cmdData, e *cmdEvent) error {
	ctx := e.Ctx
	if err := reply.Defer(ctx, e, false); err != nil {
		return err
	}
	guildID := e.GuildID().String()
	event, err := ev.find(ctx, guildID, data.String("event"))
	if err != nil {
		return err
	}
	parts, err := ev.d.API.GetEventParticipants(ctx, guildID, event.WomID)
	if err != nil {
		return reply.WithOverrides(err, str.EventErrors(event.Name, ""))
	}

	ids := make([]string, len(parts))
	for i, p := range parts {
		ids[i] = p.UserID
	}
	found, err := members.Fetch(ctx, e.Client().Rest, *e.GuildID(), ids)
	if err != nil {
		return err
	}
	lines := []string{str.EventInfoHeader(event.Name)}
	for _, p := range parts {
		name := "<@" + p.UserID + ">" // TS skipped winners who had left
		if m, ok := found[p.UserID]; ok {
			name = m.EffectiveName()
		}
		lines = append(lines, str.EventPlacement(p.Placement, name))
	}
	return reply.Text(ctx, e, strings.Join(lines, "\n"))
}

func (ev *events) remove(data cmdData, e *cmdEvent) error {
	ctx := e.Ctx
	if err := reply.Defer(ctx, e, true); err != nil {
		return err
	}
	guildID := e.GuildID().String()
	event, err := ev.find(ctx, guildID, data.String("event"))
	if err != nil {
		return err
	}
	if err := ev.d.API.DeleteEvent(ctx, guildID, event.WomID); err != nil {
		return reply.WithOverrides(err, str.EventErrors(event.Name, ""))
	}
	ev.d.Catalog.EventsChanged(guildID)
	return reply.Ephemeral(ctx, e, str.EventDeleted(event.Name))
}

// update reads the event first so the reply shows a real From -> To.
func (ev *events) update(e *cmdEvent, womID string, u tectonic.EventUpdate, change func(tectonic.Event) str.Change) error {
	ctx := e.Ctx
	if err := reply.Defer(ctx, e, true); err != nil {
		return err
	}
	guildID := e.GuildID().String()
	event, err := ev.find(ctx, guildID, womID)
	if err != nil {
		return err
	}
	if err := ev.d.API.UpdateEvent(ctx, guildID, womID, u); err != nil {
		return reply.WithOverrides(err, str.EventErrors(event.Name, ""))
	}
	ev.d.Catalog.EventsChanged(guildID)
	return reply.Ephemeral(ctx, e, str.Updated("Event **"+event.Name+"**", change(event)))
}

func (ev *events) rename(data cmdData, e *cmdEvent) error {
	name := strings.TrimSpace(data.String("name"))
	return ev.update(e, data.String("event"), tectonic.EventUpdate{Name: &name}, func(old tectonic.Event) str.Change {
		return str.Change{Field: "Name", From: old.Name, To: name}
	})
}

func (ev *events) cutoff(data cmdData, e *cmdEvent) error {
	n := data.Int("cutoff")
	return ev.update(e, data.String("event"), tectonic.EventUpdate{PositionCutoff: &n}, func(old tectonic.Event) str.Change {
		return str.Change{Field: "Winning placements", From: strconv.Itoa(old.PositionCutoff), To: strconv.Itoa(n)}
	})
}

func (ev *events) solo(data cmdData, e *cmdEvent) error {
	solo := data.Bool("solo")
	return ev.update(e, data.String("event"), tectonic.EventUpdate{Solo: &solo}, func(old tectonic.Event) str.Change {
		return str.Change{Field: "Solo", From: str.YesNo(old.Solo), To: str.YesNo(solo)}
	})
}

func (ev *events) createTeam(data cmdData, e *cmdEvent) error {
	var teams []string
	for _, opt := range []string{"team1", "team2", "team3"} {
		if t, ok := data.OptString(opt); ok && strings.TrimSpace(t) != "" {
			teams = append(teams, strings.TrimSpace(t))
		}
	}
	return ev.register(e, tectonic.NewEvent{CompetitionID: data.Int("competition"), Teams: teams})
}

func (ev *events) createIndividual(data cmdData, e *cmdEvent) error {
	top, ok := data.OptInt("top")
	if !ok {
		top = 3
	}
	return ev.register(e, tectonic.NewEvent{CompetitionID: data.Int("competition"), PositionCutoff: top})
}

// register records the winners, then names the new event in the reply. TS
// only replied "Success".
func (ev *events) register(e *cmdEvent, n tectonic.NewEvent) error {
	ctx := e.Ctx
	if err := reply.Defer(ctx, e, true); err != nil {
		return err
	}
	guildID := e.GuildID().String()
	id := strconv.Itoa(n.CompetitionID)
	if err := ev.d.API.RegisterEvent(ctx, guildID, n); err != nil {
		return reply.WithOverrides(err, str.EventErrors("", id))
	}
	ev.d.Catalog.EventsChanged(guildID)

	name := "#" + id
	if event, err := ev.find(ctx, guildID, id); err == nil {
		name = event.Name
	}
	return reply.Ephemeral(ctx, e, str.EventRegistered(name))
}

func (ev *events) createLegacy(data cmdData, e *cmdEvent) error {
	ctx := e.Ctx
	name := strings.TrimSpace(data.String("name"))
	ids := ParseUserIDs(data.String("winners"))
	if len(ids) == 0 {
		return reply.UserError(str.NoLegacyWinners)
	}
	if err := reply.Defer(ctx, e, true); err != nil {
		return err
	}
	guildID := e.GuildID().String()
	if err := ev.d.API.RegisterLegacyEvent(ctx, guildID, name, ids); err != nil {
		return reply.WithOverrides(err, str.EventErrors(name, ""))
	}
	ev.d.Catalog.EventsChanged(guildID)
	return reply.Ephemeral(ctx, e, str.LegacyEventRegistered(name, ids))
}

var userIDPattern = regexp.MustCompile(`\d{17,20}`)

// ParseUserIDs finds user IDs in "1, 2", "<@1> <@2>" or any mix, without
// duplicates. TS only accepted comma separated raw IDs.
func ParseUserIDs(s string) []string {
	var out []string
	seen := map[string]bool{}
	for _, id := range userIDPattern.FindAllString(s, -1) {
		if !seen[id] {
			seen[id] = true
			out = append(out, id)
		}
	}
	return out
}

func (ev *events) eventAutocomplete(e *handler.AutocompleteEvent) error {
	list, err := ev.d.Catalog.Events(e.Ctx, e.GuildID().String())
	if err != nil {
		return err
	}
	return e.AutocompleteResult(catalog.Choices(list, e.Data.Focused().String(),
		func(ev tectonic.Event) string { return ev.Name },
		func(ev tectonic.Event) string { return ev.WomID }))
}

// teamAutocomplete lists the competition's teams from Wise Old Man, leaving
// out teams already picked in another option.
func (ev *events) teamAutocomplete(e *handler.AutocompleteEvent) error {
	id, ok := e.Data.OptInt("competition")
	if !ok {
		return e.AutocompleteResult(nil)
	}
	teams, err := ev.d.Wom.Teams(e.Ctx, id)
	if err != nil {
		return err
	}
	focused := e.Data.Focused().Name
	var open []string
	for _, t := range teams {
		taken := false
		for _, other := range []string{"team1", "team2", "team3"} {
			if v, ok := e.Data.OptString(other); ok && other != focused && v == t {
				taken = true
			}
		}
		if !taken {
			open = append(open, t)
		}
	}
	same := func(s string) string { return s }
	return e.AutocompleteResult(catalog.Choices(open, e.Data.Focused().String(), same, same))
}
