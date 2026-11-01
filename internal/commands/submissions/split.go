package submissions

import (
	"context"
	"fmt"
	"strings"

	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/handler"

	"github.com/Miconen/tectonic-bot/internal/approval"
	"github.com/Miconen/tectonic-bot/internal/award"
	"github.com/Miconen/tectonic-bot/internal/deps"
	"github.com/Miconen/tectonic-bot/internal/pointsrc"
	"github.com/Miconen/tectonic-bot/internal/preview"
	"github.com/Miconen/tectonic-bot/internal/reply"
	"github.com/Miconen/tectonic-bot/internal/str"
	"github.com/Miconen/tectonic-bot/internal/team"
	"github.com/Miconen/tectonic-bot/internal/tectonic"
)

const splitMaxPlayers = 8

var splitCommand = discord.SlashCommandCreate{
	Name:        "split",
	Description: "Receive points for splitting",
	Options: append([]discord.ApplicationCommandOption{
		discord.ApplicationCommandOptionString{
			Name: "value", Description: "Value of the split drop?", Required: true,
			Choices: []discord.ApplicationCommandOptionChoiceString{
				{Name: "2-100m", Value: "split_low"},
				{Name: "100-500m", Value: "split_medium"},
				{Name: "500m+", Value: "split_high"},
			},
		},
		screenshotOption("Screenshot proof of the drop"),
	}, team.PlayerOptions(splitMaxPlayers, 1)...),
}

// split: everyone tagged must be activated, but only the submitter gets the
// points.
func (s *service) split(data discord.SlashCommandInteractionData, e *handler.CommandEvent) error {
	ctx := e.Ctx
	players, err := team.FromInteraction(data, *e.Member(), splitMaxPlayers)
	if err != nil {
		return err
	}
	guild, err := s.begin(ctx, e, players)
	if err != nil {
		return err
	}

	source := data.String("value")
	pts, err := s.d.Sources.Resolve(ctx, guild, source)
	if err != nil {
		return reply.WithOverrides(err, str.GuildErrors(str.GuildArgs{PointSource: source}))
	}

	submitter := players[0]
	partners := team.IDs(players[1:])
	pv := preview.Build(ctx, s.d.API, s.d.Ranks, guild.GuildID, []string{submitter.ID}, pts.Points)

	return s.approvals.Post(ctx, e, guild, approval.Submission{
		Content:    str.SplitRequestSubmitted(pts.Name, pts.Points, submitter.Name, partners, pv),
		Screenshot: data.Attachment("screenshot"),
		Request:    &splitRequest{d: s.d, submitter: submitter, points: pts},
	})
}

type splitRequest struct {
	d         deps.Deps
	submitter team.Player
	points    pointsrc.Resolved
}

func (r *splitRequest) Kind() string { return "split" }

func (r *splitRequest) Label() string {
	return fmt.Sprintf("Split: %s | %dpts — %s", r.points.Name, r.points.Points, r.submitter.Name)
}

func (r *splitRequest) DenyMessage() string {
	return str.SplitDenied(r.points.Name, r.points.Points, r.submitter.Name)
}

func (r *splitRequest) Accept(ctx context.Context, env approval.Env) (approval.Result, error) {
	ms, err := membersInOrder(ctx, env, []string{r.submitter.ID})
	if err != nil {
		return approval.Result{}, err
	}
	// The amount was resolved (multiplier included) when the request was made,
	// so moderators approve exactly what the preview showed.
	awarded, err := award.Give(ctx, r.d, env.Client.Rest, env.GuildID, ms, tectonic.CustomPoints(r.points.Points))
	if err != nil {
		return approval.Result{}, reply.WithOverrides(err, str.GuildErrors(str.GuildArgs{}))
	}
	return approval.Result{Message: strings.Join([]string{str.SplitApproved(r.points.Name, r.points.Points), awarded}, "\n")}, nil
}
