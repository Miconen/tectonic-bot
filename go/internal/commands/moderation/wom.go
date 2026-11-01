package moderation

import (
	"strconv"
	"strings"

	"github.com/Miconen/tectonic-bot/go/internal/award"
	"github.com/Miconen/tectonic-bot/go/internal/logging"
	"github.com/Miconen/tectonic-bot/go/internal/members"
	"github.com/Miconen/tectonic-bot/go/internal/ranks"
	"github.com/Miconen/tectonic-bot/go/internal/reply"
	"github.com/Miconen/tectonic-bot/go/internal/str"
	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
)

// pointsWom ends a WOM competition: the API gives points to everyone over the
// cutoff, and this syncs their rank roles and lists RSNs nobody has linked.
func (m *mod) pointsWom(data cmdData, e *cmdEvent) error {
	ctx := e.Ctx
	competition := data.Int("competition")
	if err := reply.Defer(ctx, e, false); err != nil {
		return err
	}
	guildID := e.GuildID().String()
	res, err := m.d.API.EndCompetition(ctx, guildID, competition, data.Int("cutoff"))
	if err != nil {
		return reply.WithOverrides(err, str.EventErrors("", strconv.Itoa(competition)))
	}
	if len(res.Participants) == 0 && len(res.Accounts) == 0 {
		return reply.UserError(str.NoEligibleParticipants)
	}

	lines := []string{
		str.CompetitionHeader(res.Title),
		str.CompetitionCounts(res.ParticipantCount, len(res.Participants)),
	}

	if len(res.Participants) > 0 {
		lines = append(lines, str.PointsHeader)
		ids := make([]string, len(res.Participants))
		for i, p := range res.Participants {
			ids[i] = p.UserID
		}
		found, err := members.Fetch(ctx, e.Client().Rest, *e.GuildID(), ids)
		if err != nil {
			return err
		}
		rankList := m.d.Ranks.Get(ctx, guildID)
		for _, p := range res.Participants {
			mem, ok := found[p.UserID]
			if !ok {
				continue
			}
			old := p.Points - res.PointsGiven
			t, err := ranks.ApplyTransition(ctx, e.Client().Rest, *e.GuildID(), rankMember(mem), rankList, old, p.Points)
			if err != nil {
				// Points are already given; keep listing everyone.
				logging.Logger(ctx).Warn("Failed to sync rank roles", "user", p.UserID, "err", err)
			}
			lines = append(lines, award.Format(mem.EffectiveName(), res.PointsGiven, p.Points, t))
		}
	}

	if unlinked := unlinkedAccounts(res.Participants, res.Accounts); len(unlinked) > 0 {
		lines = append(lines, str.UnlinkedHeader)
		for _, rsn := range unlinked {
			lines = append(lines, str.UnlinkedAccount(rsn, res.PointsGiven))
		}
		lines = append(lines, str.UnlinkInstructions)
	}
	return reply.Text(ctx, e, strings.Join(lines, "\n"))
}

// unlinkedAccounts are the eligible RSNs that no participant has linked.
func unlinkedAccounts(participants []tectonic.DetailedUser, accounts []tectonic.RSN) []string {
	linked := map[string]bool{}
	for _, p := range participants {
		for _, r := range p.RSNs {
			linked[r.WomID] = true
		}
	}
	var out []string
	for _, a := range accounts {
		if !linked[a.WomID] {
			out = append(out, a.RSN)
		}
	}
	return out
}
