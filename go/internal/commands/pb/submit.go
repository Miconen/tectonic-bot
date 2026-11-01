package pb

import (
	"context"
	"sort"
	"strconv"
	"strings"

	"github.com/disgoorg/disgo/discord"
	"github.com/disgoorg/disgo/handler"

	"github.com/Miconen/tectonic-bot/go/internal/approval"
	"github.com/Miconen/tectonic-bot/go/internal/deps"
	"github.com/Miconen/tectonic-bot/go/internal/ranks"
	"github.com/Miconen/tectonic-bot/go/internal/reply"
	"github.com/Miconen/tectonic-bot/go/internal/str"
	"github.com/Miconen/tectonic-bot/go/internal/team"
	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
	"github.com/Miconen/tectonic-bot/go/internal/timefmt"
)

const clanPBSource = "clan_pb"

type submitter struct {
	d         deps.Deps
	bosses    Bosses
	approvals *approval.Service
}

// submit is pbRequestHelper plus the IsValidTime and IsActivated guards, shared
// by every /pb subcommand.
func (s *submitter) submit(v variant, data discord.SlashCommandInteractionData, e *handler.CommandEvent) error {
	ctx := e.Ctx
	guildID := e.GuildID().String()

	players, err := team.FromInteraction(data, *e.Member(), v.players())
	if err != nil {
		return err
	}

	bossName := data.String(v.boss())
	if v.bossFor != nil {
		bossName = v.bossFor(len(players), data.Int("raidlevel"))
	}
	boss, ok := s.bosses[bossName]
	if !ok || (v.category != "" && boss.Category != v.category) {
		return reply.UserError(str.PBUnknownBoss)
	}
	if v.validate != nil {
		if err := v.validate(bossName, len(players)); err != nil {
			return err
		}
	}

	value, err := parseValue(boss, data.String(v.value()))
	if err != nil {
		return err
	}

	// Everything above is local; the rest calls the API.
	if err := reply.Defer(ctx, e, false); err != nil {
		return err
	}
	if err := team.RequireActivated(ctx, s.d.API, guildID, players); err != nil {
		return err
	}

	guild, err := s.d.API.GetDetailedGuild(ctx, guildID)
	if err != nil {
		return reply.WithOverrides(err, str.RecordErrors())
	}
	if cutoff, ok := cutoff(guild, boss, value); ok {
		return reply.UserError(str.PBNotFaster(strings.ToLower(valueLabel(boss)), display(boss, value), display(boss, cutoff)))
	}

	points, err := s.d.Sources.Resolve(ctx, guild.Guild, clanPBSource)
	if err != nil {
		return reply.WithOverrides(err, str.GuildErrors(str.GuildArgs{PointSource: clanPBSource}))
	}

	preview, err := s.preview(ctx, guildID, players, points.Points)
	if err != nil {
		return err
	}

	req := &request{
		d:      s.d,
		boss:   boss,
		value:  value,
		team:   team.IDs(players),
		points: points,
	}
	return s.approvals.Post(ctx, e, guild.Guild, approval.Submission{
		Content:    str.PBRequestSubmitted(req.title(), valueLabel(boss), displayWithTicks(boss, value), points.Name, points.Points, preview),
		Screenshot: data.Attachment("screenshot"),
		Request:    req,
	})
}

// parseValue reads a time as ticks, or a positive whole number for bosses
// that track something else (e.g. depth).
func parseValue(boss tectonic.Boss, input string) (int, error) {
	if boss.IsTime() {
		ticks, err := timefmt.ParseTicks(input)
		if err != nil {
			return 0, reply.UserError(err.Error())
		}
		return ticks, nil
	}
	n, err := strconv.Atoi(strings.TrimSpace(input))
	if err != nil || n < 1 {
		return 0, reply.UserError(str.PBInvalidValue(strings.ToLower(valueLabel(boss))))
	}
	return n, nil
}

// cutoff returns the worst value still on the board when the board is full
// and value wouldn't beat it.
func cutoff(guild tectonic.DetailedGuild, boss tectonic.Boss, value int) (int, bool) {
	positions := guild.PositionCount
	if positions == 0 {
		positions = 3
	}

	var records []tectonic.GuildRecord
	for _, r := range guild.Records {
		if r.BossName == boss.Name {
			records = append(records, r)
		}
	}
	if len(records) < positions {
		return 0, false
	}
	sort.Slice(records, func(i, j int) bool { return records[i].Position < records[j].Position })

	last := records[len(records)-1].Value
	worse := value >= last // times: lower is better
	if !boss.IsTime() {
		worse = value <= last
	}
	return last, worse
}

// preview shows each player's points and rank if the request is approved.
func (s *submitter) preview(ctx context.Context, guildID string, players []team.Player, points int) (string, error) {
	users, err := s.d.API.GetUsers(ctx, guildID, tectonic.ByUserID(team.IDs(players)...))
	if err != nil {
		return "", reply.WithOverrides(err, str.AccountErrors(str.AccountArgs{}))
	}
	byID := map[string]tectonic.DetailedUser{}
	for _, u := range users {
		byID[u.UserID] = u
	}

	rankList := s.d.Ranks.Get(ctx, guildID)
	lines := []string{str.PreviewHeader}
	for _, p := range players {
		u, ok := byID[p.ID]
		if !ok {
			lines = append(lines, str.PreviewUnknown(p.ID))
			continue
		}
		t := ranks.GetTransition(rankList, u.Points, u.Points+points)
		line := str.PreviewLine(p.ID, u.Points, ranks.Icon(t.Old), u.Points+points, ranks.Icon(t.New))
		if t.Changed {
			name := "Unranked"
			if t.New != nil {
				name = t.New.Name
			}
			line += str.PreviewRankChange(points >= 0, ranks.Icon(t.New), str.DisplayName(name))
		}
		lines = append(lines, line)
	}
	return strings.Join(lines, "\n"), nil
}

func valueLabel(b tectonic.Boss) string {
	if b.ValueType == "" {
		return "Time"
	}
	return str.DisplayName(b.ValueType)
}

// display formats a value for the board: 1:23.40 or 450.
func display(b tectonic.Boss, v int) string {
	if b.IsTime() {
		return timefmt.TicksToTime(v)
	}
	return strconv.Itoa(v)
}

// displayWithTicks adds the tick count to times: 1:23.40 (139 ticks).
func displayWithTicks(b tectonic.Boss, v int) string {
	if b.IsTime() {
		return timefmt.TicksToTime(v) + " (" + strconv.Itoa(v) + " ticks)"
	}
	return strconv.Itoa(v)
}
