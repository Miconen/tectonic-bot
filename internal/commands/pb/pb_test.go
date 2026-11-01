package pb

import (
	"errors"
	"strings"
	"testing"

	"github.com/disgoorg/disgo/discord"

	"github.com/Miconen/tectonic-bot/internal/reply"
	"github.com/Miconen/tectonic-bot/internal/str"
	"github.com/Miconen/tectonic-bot/internal/tectonic"
)

// A slice of the API's real boss list (tectonic-api migrations).
var testBosses = []tectonic.Boss{
	{Name: "cox_1", DisplayName: "Solo", Category: "Chambers of Xeric"},
	{Name: "cox_3", DisplayName: "Trio", Category: "Chambers of Xeric"},
	{Name: "cox_any", DisplayName: "Any", Category: "Chambers of Xeric"},
	{Name: "toa_solo_150", DisplayName: "Solo 150+", Category: "Tombs of Amascut"},
	{Name: "toa_team_400", DisplayName: "Team 400+", Category: "Tombs of Amascut"},
	{Name: "nm_1", DisplayName: "Solo", Category: "Nightmare"},
	{Name: "nm_5", DisplayName: "5-man", Category: "Nightmare"},
	{Name: "zulrah", DisplayName: "Zulrah", Category: "Miscellaneous"},
	{Name: "royal_titans_2", DisplayName: "Royal Titans (Duo)", Category: "Miscellaneous"},
	{Name: "colosseum", DisplayName: "Fortis Colosseum", Category: "Varlamore"},
	{Name: "doom", DisplayName: "Doom of Mokhaiotl", Category: "Varlamore", ValueType: "depth"},
	{Name: "sep_5", DisplayName: "Sepulchre Floor 5", Category: "Sepulchre"},
}

func find(name string) variant {
	for _, v := range variants {
		if v.name == name {
			return v
		}
	}
	panic(name)
}

func TestBossNames(t *testing.T) {
	cases := []struct {
		variant     string
		size, level int
		want        string
	}{
		{"cox", 1, 0, "cox_1"},
		{"cox", 4, 0, "cox_any"},
		{"cox", 5, 0, "cox_5"},
		{"cm", 8, 0, "cm_any"},
		{"toa", 1, 299, "toa_solo_150"},
		{"toa", 3, 400, "toa_team_400"},
		{"toa", 2, 600, "toa_team_500"},
		{"tob", 4, 0, "tob_4"},
		{"hmt", 1, 0, "hmt_1"},
		{"titans", 2, 0, "royal_titans_2"},
		{"yama", 2, 0, "yama_2"},
	}
	for _, c := range cases {
		if got := find(c.variant).bossFor(c.size, c.level); got != c.want {
			t.Errorf("%s(%d, %d) = %s, want %s", c.variant, c.size, c.level, got, c.want)
		}
	}
}

func TestCommandShape(t *testing.T) {
	cmd := Command(testBosses)
	if len(cmd.Options) != len(variants) {
		t.Fatalf("got %d subcommands", len(cmd.Options))
	}

	for _, o := range cmd.Options {
		sub := o.(discord.ApplicationCommandOptionSubCommand)
		seenOptional := false
		for _, opt := range sub.Options {
			// Discord rejects a required option after an optional one.
			req := isRequired(opt)
			if req && seenOptional {
				t.Errorf("/pb %s: required option %s after an optional one", sub.Name, opt.OptionName())
			}
			if !req {
				seenOptional = true
			}
		}
	}

	misc := subcommand(cmd, "miscellaneous")
	choices := misc.Options[0].(discord.ApplicationCommandOptionString).Choices
	if len(choices) != 1 || choices[0].Value != "zulrah" {
		t.Errorf("miscellaneous should list zulrah only (titans excluded), got %+v", choices)
	}

	titans := subcommand(cmd, "titans")
	if p2 := titans.Options[len(titans.Options)-1].(discord.ApplicationCommandOptionUser); p2.Name != "player2" || !p2.Required {
		t.Errorf("titans player2 should be required: %+v", p2)
	}

	cox := subcommand(cmd, "cox")
	if last := cox.Options[len(cox.Options)-1].OptionName(); last != "player8" {
		t.Errorf("cox last option = %s, want player8", last)
	}

	sep := subcommand(cmd, "sepulchre")
	if sep.Options[0].OptionName() != "floor" {
		t.Errorf("sepulchre choice should be named floor")
	}
	if subcommand(cmd, "varlamore").Options[1].OptionName() != "value" {
		t.Errorf("varlamore should take a value option")
	}
}

func isRequired(o discord.ApplicationCommandOption) bool {
	switch v := o.(type) {
	case discord.ApplicationCommandOptionString:
		return v.Required
	case discord.ApplicationCommandOptionInt:
		return v.Required
	case discord.ApplicationCommandOptionAttachment:
		return v.Required
	case discord.ApplicationCommandOptionUser:
		return v.Required
	}
	return false
}

func subcommand(cmd discord.SlashCommandCreate, name string) discord.ApplicationCommandOptionSubCommand {
	for _, o := range cmd.Options {
		if s := o.(discord.ApplicationCommandOptionSubCommand); s.Name == name {
			return s
		}
	}
	panic(name)
}

func TestNightmareRules(t *testing.T) {
	if err := nightmare("nm_1", 2); !isUserErr(err, str.PBSoloOnlyBoss) {
		t.Errorf("solo nightmare with 2 players: %v", err)
	}
	if err := nightmare("nm_5", 4); !isUserErr(err, str.PBInvalidFiveNightmare) {
		t.Errorf("5-man with 4: %v", err)
	}
	if err := nightmare("nm_5", 5); err != nil {
		t.Errorf("5-man with 5: %v", err)
	}
}

func isUserErr(err error, msg string) bool {
	var u reply.UserError
	return errors.As(err, &u) && string(u) == msg
}

func TestParseValue(t *testing.T) {
	bosses := NewBosses(testBosses)
	if v, err := parseValue(bosses["colosseum"], "21:30.6"); err != nil || v != 2151 {
		t.Errorf("time: %d %v", v, err)
	}
	if v, err := parseValue(bosses["doom"], " 450 "); err != nil || v != 450 {
		t.Errorf("depth: %d %v", v, err)
	}
	if _, err := parseValue(bosses["doom"], "1:00"); err == nil || !strings.Contains(err.Error(), "depth") {
		t.Errorf("depth given a time: %v", err)
	}
	if _, err := parseValue(bosses["colosseum"], "21"); err == nil {
		t.Error("expected a time format error")
	}
}

func TestCutoff(t *testing.T) {
	zulrah := NewBosses(testBosses)["zulrah"]
	doom := NewBosses(testBosses)["doom"]
	g := tectonic.DetailedGuild{
		Guild: tectonic.Guild{PositionCount: 2},
		Records: []tectonic.GuildRecord{
			{BossName: "zulrah", Position: 2, Value: 120},
			{BossName: "zulrah", Position: 1, Value: 100},
			{BossName: "doom", Position: 1, Value: 500},
		},
	}

	if c, worse := cutoff(g, zulrah, 120); !worse || c != 120 {
		t.Errorf("tying the last time should not qualify: %d %v", c, worse)
	}
	if _, worse := cutoff(g, zulrah, 119); worse {
		t.Error("faster time should qualify")
	}
	if _, worse := cutoff(g, doom, 1); worse {
		t.Error("board not full, anything qualifies")
	}

	g.Guild.PositionCount = 1
	if _, worse := cutoff(g, doom, 600); worse {
		t.Error("deeper should qualify (higher is better)")
	}
	if _, worse := cutoff(g, doom, 500); !worse {
		t.Error("equal depth should not qualify")
	}
}

func TestEmbed(t *testing.T) {
	msg := "999"
	g := tectonic.DetailedGuild{
		Bosses:          testBosses,
		Categories:      []tectonic.Category{{Name: "Miscellaneous", Thumbnail: "https://x/misc.png"}},
		GuildCategories: []tectonic.GuildCategory{{Category: "Miscellaneous", MessageID: &msg}},
		GuildBosses: []tectonic.GuildBoss{
			{Boss: "zulrah", Category: "Miscellaneous"},
			{Boss: "royal_titans_2", Category: "Miscellaneous"},
		},
		Records: []tectonic.GuildRecord{
			{RecordID: 1, BossName: "royal_titans_2", Position: 1, Value: 100},
			{RecordID: 2, BossName: "royal_titans_2", Position: 2, Value: 150},
		},
		Teammates: []tectonic.RecordTeammate{{RecordID: 1, UserID: "1"}, {RecordID: 1, UserID: "2"}, {RecordID: 2, UserID: "3"}},
	}

	c, ok := categoryFor(g, "zulrah")
	if !ok || c.messageID != "999" {
		t.Fatalf("category lookup failed: %+v", c)
	}

	e := renderEmbed(c, map[string]string{"1": "Zez"})
	if e.Title != "Miscellaneous" || e.Color != embedColor || e.Thumbnail.URL != "https://x/misc.png" {
		t.Errorf("embed header: %+v", e)
	}
	want := []discord.EmbedField{
		{Name: "Royal Titans (Duo)", Value: "`01:00.00` - **Zez**, **<@2>**"},
		{Name: "Zulrah", Value: "`No record yet`"},
	}
	if len(e.Fields) != 2 || e.Fields[0] != want[0] || e.Fields[1] != want[1] {
		t.Errorf("fields:\n got %+v\nwant %+v", e.Fields, want)
	}

	if _, ok := categoryFor(g, "unknown"); ok {
		t.Error("unknown boss should have no category")
	}
}
