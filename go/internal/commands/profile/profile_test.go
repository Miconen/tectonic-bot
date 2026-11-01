package profile

import (
	"strings"
	"testing"

	"github.com/Miconen/tectonic-bot/go/internal/ranks"
	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
)

func ptr(s string) *string { return &s }

func TestRender(t *testing.T) {
	rankList := []ranks.Rank{
		{Name: "jade", MinPoints: 0, Icon: ptr("<J>")},
		{Name: "red_topaz", MinPoints: 100, Icon: ptr("<R>")},
	}
	u := &tectonic.DetailedUser{
		UserID: "42",
		Points: 60,
		Rank:   3,
		RSNs:   []tectonic.RSN{{RSN: "Zezima"}},
		Events: []tectonic.UserEvent{
			{Name: "Bossing Bash", WomID: "123", Placement: 2, PositionCutoff: 3, Solo: true},
			{Name: "Too far down", WomID: "124", Placement: 9, PositionCutoff: 3},
			{Name: "Team Clash", WomID: "125", Placement: 1, PositionCutoff: 1},
			{Name: "Old Times", WomID: "legacy_1", Placement: 1, PositionCutoff: 3, Solo: true},
		},
		Achievements: []tectonic.Achievement{{Name: "Maxed", DiscordIcon: ":max:"}},
		Records: []tectonic.UserRecord{
			{RecordID: 10, BossName: "zulrah", DisplayName: "Zulrah", Category: "Solo", Value: 100, ValueType: "time"},
			{RecordID: 11, BossName: "vorkath", DisplayName: "Vorkath", Category: "Solo", Value: 5, ValueType: "count"},
			{RecordID: 12, BossName: "jad", DisplayName: "Jad", Category: "Solo", Value: 1},
		},
	}
	guild := tectonic.GuildRecords{
		Records: []tectonic.GuildRecord{
			{RecordID: 10, BossName: "zulrah", Position: 1},
			{RecordID: 11, BossName: "vorkath", Position: 2},
			{RecordID: 12, BossName: "jad", Position: 1},
		},
		Teammates: []tectonic.RecordTeammate{
			{RecordID: 10, UserID: "42"},
			{RecordID: 11, UserID: "42"},
			{RecordID: 12, UserID: "99"}, // someone else's record
		},
	}

	got := render("Zez", u, guild, rankList)
	want := strings.Join([]string{
		"# <J> Zez",
		"-# Rank: #3 | Points: 60 | PBs: 2 | Events: 3",
		"<R> Points to next level: 40",
		"## Accounts",
		"`Zezima`",
		"## Clan PBs",
		"**#1** in **Solo** `Zulrah` - `01:00.00`",
		"**#2** in **Solo** `Vorkath` - `5`",
		"## Event Placements",
		"**#2** in **[Bossing Bash](<https://wiseoldman.net/competitions/123>)**",
		"**Winner** in **[Team Clash](<https://wiseoldman.net/competitions/125>)**",
		"**Winner** in **Old Times**",
		"## Achievements",
		":max: - **Maxed**",
	}, "\n")

	if got != want {
		t.Errorf("render mismatch\n--- got ---\n%s\n--- want ---\n%s", got, want)
	}
}

func TestRenderNoAccounts(t *testing.T) {
	got := render("Zez", &tectonic.DetailedUser{UserID: "1"}, tectonic.GuildRecords{}, nil)
	want := "# \x20Zez\n-# Rank: ? | Points: 0\n Points to next level: 0\n``Link your OSRS account to be eligible for event rank points``"
	if got != want {
		t.Errorf("got %q, want %q", got, want)
	}
}
