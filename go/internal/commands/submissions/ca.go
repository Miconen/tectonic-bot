package submissions

import (
	"context"
	"fmt"
	"strings"

	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/handler"

	"github.com/Miconen/tectonic-bot/go/internal/approval"
	"github.com/Miconen/tectonic-bot/go/internal/award"
	"github.com/Miconen/tectonic-bot/go/internal/catalog"
	"github.com/Miconen/tectonic-bot/go/internal/deps"
	"github.com/Miconen/tectonic-bot/go/internal/preview"
	"github.com/Miconen/tectonic-bot/go/internal/ranks"
	"github.com/Miconen/tectonic-bot/go/internal/reply"
	"github.com/Miconen/tectonic-bot/go/internal/str"
	"github.com/Miconen/tectonic-bot/go/internal/team"
	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
)

const caMaxPlayers = 7

var caCommand = discord.SlashCommandCreate{
	Name:        "ca",
	Description: "Request points for completing a combat achievement together",
	Options: append([]discord.ApplicationCommandOption{
		discord.ApplicationCommandOptionString{Name: "achievement", Description: "The combat achievement completed", Required: true, Autocomplete: true},
		screenshotOption("Screenshot proof of the combat achievement"),
	}, team.PlayerOptions(caMaxPlayers, 1)...),
}

func (s *service) ca(data discord.SlashCommandInteractionData, e *handler.CommandEvent) error {
	ctx := e.Ctx
	players, err := team.FromInteraction(data, *e.Member(), caMaxPlayers)
	if err != nil {
		return err
	}
	guild, err := s.begin(ctx, e, players)
	if err != nil {
		return err
	}

	name := data.String("achievement")
	entry, ok, err := s.d.Catalog.CombatAchievement(ctx, guild.GuildID, name)
	if err != nil {
		return reply.WithOverrides(err, str.CombatAchievementErrors(name))
	}
	if !ok {
		return reply.UserError(str.CANameNotFound(name))
	}

	users, err := s.d.API.GetUsers(ctx, guild.GuildID, tectonic.ByUserID(team.IDs(players)...))
	if err != nil {
		return reply.WithOverrides(err, str.AccountErrors(str.AccountArgs{}))
	}
	done := map[string]bool{}
	for i := range users {
		if catalog.HasCombatAchievement(&users[i], name) {
			done[users[i].UserID] = true
		}
	}
	var already, fresh []string
	for _, p := range players {
		if done[p.ID] {
			already = append(already, p.ID)
		} else {
			fresh = append(fresh, p.ID)
		}
	}
	if len(fresh) == 0 {
		return reply.UserError(str.CAAllAlreadyCompleted)
	}

	sourceName := entry.PointSourceDisplayName
	if sourceName == "" {
		sourceName = entry.PointSource
	}
	// Only new completers gain points, so only they are previewed (the TS bot
	// previewed points for everyone).
	pv := preview.Render(fresh, users, s.d.Ranks.Get(ctx, guild.GuildID), entry.Points)

	return s.approvals.Post(ctx, e, guild, approval.Submission{
		Content:    str.CARequestSubmitted(name, players[0].Name, sourceName, entry.Points, already, fresh, pv),
		Screenshot: data.Attachment("screenshot"),
		Request:    &caRequest{d: s.d, name: name, sourceName: sourceName, points: entry.Points, team: team.IDs(players)},
	})
}

// caAutocomplete lists the guild's CAs the invoker hasn't completed.
func (s *service) caAutocomplete(e *handler.AutocompleteEvent) error {
	guildID := e.GuildID().String()
	cas, err := s.d.Catalog.CombatAchievements(e.Ctx, guildID)
	if err != nil {
		return err
	}
	u, err := s.d.Catalog.User(e.Ctx, guildID, e.User().ID.String())
	if err != nil {
		return err
	}
	var open []tectonic.CombatAchievement
	for _, ca := range cas {
		if !catalog.HasCombatAchievement(u, ca.Name) {
			open = append(open, ca)
		}
	}
	return e.AutocompleteResult(catalog.Choices(open, e.Data.Focused().String(),
		func(ca tectonic.CombatAchievement) string { return fmt.Sprintf("%s | %d points", ca.Name, ca.Points) },
		func(ca tectonic.CombatAchievement) string { return ca.Name }))
}

type caRequest struct {
	d          deps.Deps
	name       string
	sourceName string
	points     int
	team       []string
}

func (r *caRequest) Kind() string { return "ca" }

func (r *caRequest) Label() string {
	return fmt.Sprintf("CA: %s | %dpts — %d players", r.name, r.points, len(r.team))
}

func (r *caRequest) DenyMessage() string { return str.CADenied(r.sourceName, r.points, r.name) }

func (r *caRequest) Accept(ctx context.Context, env approval.Env) (approval.Result, error) {
	guildID := env.GuildID.String()
	res, err := r.d.API.CompleteCombatAchievement(ctx, guildID, r.name, r.team)
	if err != nil {
		return approval.Result{}, reply.WithOverrides(err, str.CombatAchievementErrors(r.name))
	}
	for _, id := range r.team {
		r.d.Catalog.UserChanged(guildID, id)
	}

	ms, err := membersInOrder(ctx, env, r.team)
	if err != nil {
		return approval.Result{}, err
	}
	byID := map[string]discord.Member{}
	for _, m := range ms {
		byID[m.User.ID.String()] = m
	}

	lines := []string{str.CAApproved(r.sourceName, r.points)}
	var warnings []string
	rankList := r.d.Ranks.Get(ctx, guildID)
	for _, u := range res {
		m, ok := byID[u.UserID]
		if !ok {
			continue
		}
		t, err := ranks.ApplyTransition(ctx, env.Client.Rest, env.GuildID, ranks.Member{ID: m.User.ID, RoleIDs: m.RoleIDs}, rankList, u.Points-u.GivenPoints, u.Points)
		if err != nil {
			warnings = append(warnings, fmt.Sprintf("Couldn't update rank roles for %s: %v", m.EffectiveName(), err))
		}
		lines = append(lines, award.Format(m.EffectiveName(), u.GivenPoints, u.Points, t))
	}
	return approval.Result{Message: strings.Join(lines, "\n"), Warnings: warnings}, nil
}
