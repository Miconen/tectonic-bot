package submissions

import (
	"context"
	"strings"

	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/handler"

	"github.com/Miconen/tectonic-bot/internal/approval"
	"github.com/Miconen/tectonic-bot/internal/catalog"
	"github.com/Miconen/tectonic-bot/internal/deps"
	"github.com/Miconen/tectonic-bot/internal/opt"
	"github.com/Miconen/tectonic-bot/internal/reply"
	"github.com/Miconen/tectonic-bot/internal/str"
	"github.com/Miconen/tectonic-bot/internal/team"
	"github.com/Miconen/tectonic-bot/internal/tectonic"
)

var achievementCommand = discord.SlashCommandCreate{
	Name:        "achievement",
	Description: "Submit an achievement request for admin approval",
	Options: []discord.ApplicationCommandOption{
		opt.Autocomplete("achievement", "Achievement to request"),
		screenshotOption("Screenshot proof of the achievement"),
	},
}

func (s *service) achievement(data discord.SlashCommandInteractionData, e *handler.CommandEvent) error {
	ctx := e.Ctx
	me := invoker(e)
	name := data.String("achievement")

	// The TS bot accepted any text here; only real achievements can be granted.
	if !s.knownAchievement(name) {
		return reply.UserError(str.AchievementUnknown(name))
	}

	guild, err := s.begin(ctx, e, []team.Player{me})
	if err != nil {
		return err
	}
	u, err := s.d.Catalog.User(ctx, guild.GuildID, me.ID)
	if err != nil {
		return reply.WithOverrides(err, str.AccountErrors(str.AccountArgs{Username: me.Name}))
	}
	if catalog.HasAchievement(u, name) {
		return reply.UserError(str.AchievementAlreadyHas(me.Name, name))
	}

	return s.approvals.Post(ctx, e, guild, approval.Submission{
		Content:    str.AchievementRequestSubmitted(name, me.Name),
		Screenshot: data.Attachment("screenshot"),
		Request:    &achievementRequest{d: s.d, user: me, name: name},
	})
}

func (s *service) knownAchievement(name string) bool {
	for _, a := range s.d.Catalog.Achievements {
		if a.Name == name {
			return true
		}
	}
	return false
}

// achievementAutocomplete lists achievements the invoker doesn't have yet.
func (s *service) achievementAutocomplete(e *handler.AutocompleteEvent) error {
	u, err := s.d.Catalog.User(e.Ctx, e.GuildID().String(), e.User().ID.String())
	if err != nil {
		return err
	}
	var missing []tectonic.Achievement
	for _, a := range s.d.Catalog.Achievements {
		if !catalog.HasAchievement(u, a.Name) {
			missing = append(missing, a)
		}
	}
	name := func(a tectonic.Achievement) string { return a.Name }
	return e.AutocompleteResult(catalog.Choices(missing, e.Data.Focused().String(), name, name))
}

type achievementRequest struct {
	d    deps.Deps
	user team.Player
	name string
}

func (r *achievementRequest) Kind() string  { return "achievement" }
func (r *achievementRequest) Label() string { return "Achievement: " + r.name + " — " + r.user.Name }

func (r *achievementRequest) DenyMessage() string { return str.AchievementDenied(r.name, r.user.Name) }

func (r *achievementRequest) Accept(ctx context.Context, env approval.Env) (approval.Result, error) {
	guildID := env.GuildID.String()
	if err := r.d.API.GiveAchievement(ctx, guildID, tectonic.ByUserID(r.user.ID), r.name); err != nil {
		return approval.Result{}, reply.WithOverrides(err, str.AchievementErrors(r.user.Name, r.name))
	}
	r.d.Catalog.UserChanged(guildID, r.user.ID)
	return approval.Result{Message: strings.Join([]string{str.AchievementApproved(r.name), str.AchievementGranted(r.name, r.user.Name)}, "\n")}, nil
}
