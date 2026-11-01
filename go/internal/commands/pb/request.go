package pb

import (
	"context"
	"fmt"
	"strings"

	"github.com/disgoorg/disgo/discord"

	"github.com/Miconen/tectonic-bot/go/internal/approval"
	"github.com/Miconen/tectonic-bot/go/internal/commands/points"
	"github.com/Miconen/tectonic-bot/go/internal/deps"
	"github.com/Miconen/tectonic-bot/go/internal/logging"
	"github.com/Miconen/tectonic-bot/go/internal/members"
	"github.com/Miconen/tectonic-bot/go/internal/pointsrc"
	"github.com/Miconen/tectonic-bot/go/internal/reply"
	"github.com/Miconen/tectonic-bot/go/internal/str"
	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
)

// request is a PB waiting for approval (strategies/pb.ts).
type request struct {
	d      deps.Deps
	boss   tectonic.Boss
	value  int
	team   []string
	points pointsrc.Resolved
}

func (r *request) Kind() string { return "pb" }

func (r *request) title() string { return r.boss.Category + ": " + r.boss.DisplayName }

func (r *request) Label() string {
	return fmt.Sprintf("PB: %s %s — %d players", r.boss.DisplayName, display(r.boss, r.value), len(r.team))
}

func (r *request) DenyMessage() string {
	return str.PBDenied(r.title(), r.points.Name, r.points.Points)
}

func (r *request) Accept(ctx context.Context, env approval.Env) (approval.Result, error) {
	guildID := env.GuildID.String()

	rec, err := r.d.API.NewRecord(ctx, guildID, tectonic.NewRecord{UserIDs: r.team, Value: r.value, BossName: r.boss.Name})
	if err != nil {
		return approval.Result{}, reply.WithOverrides(err, str.RecordErrors())
	}
	if rec.Position == nil {
		return approval.Result{Message: str.PBNotNewRecord}, nil
	}
	logging.Logger(ctx).Info("New clan record", "position", *rec.Position, "boss", rec.BossName, "value", rec.Value)

	lines := []string{str.PBNew(*rec.Position, r.title(), valueLabel(r.boss), displayWithTicks(r.boss, rec.Value), r.points.Name, r.points.Points)}
	var res approval.Result

	// Only a new #1 updates the board and gives points.
	if *rec.Position == 1 {
		if err := updateEmbed(ctx, r.d.API, env.Client.Rest, env.GuildID, r.boss.Name); err != nil {
			logging.Logger(ctx).Warn("Failed to update leaderboard embed", "err", err)
			res.Warnings = append(res.Warnings, str.PBFailedUpdatingEmbed)
		}

		// The record is saved at this point, so a points failure must not make
		// the moderator retry (that would submit the record twice).
		awarded, err := r.award(ctx, env)
		if err != nil {
			logging.Logger(ctx).Error("Failed to award PB points", "err", err)
			res.Warnings = append(res.Warnings, str.PBPointsFailed(reply.MessageFor(ctx, err)))
		} else {
			lines = append(lines, awarded)
		}
	}

	res.Message = strings.Join(lines, "\n")
	return res, nil
}

func (r *request) award(ctx context.Context, env approval.Env) (string, error) {
	found, err := members.Fetch(ctx, env.Client.Rest, env.GuildID, r.team)
	if err != nil {
		return "", err
	}
	list := make([]discord.Member, 0, len(found))
	for _, id := range r.team {
		if m, ok := found[id]; ok {
			list = append(list, m)
		}
	}
	return points.Award(ctx, r.d, env.Client.Rest, env.GuildID, list, tectonic.PresetPoints(clanPBSource))
}
