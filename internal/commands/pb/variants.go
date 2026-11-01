package pb

import (
	"fmt"
	"strconv"

	"github.com/Miconen/tectonic-bot/internal/reply"
	"github.com/Miconen/tectonic-bot/internal/str"
)

// variant is one /pb subcommand. In the TS bot each of these was its own
// 50-115 line file; here each is a few lines of data.
type variant struct {
	name     string
	timeDesc string

	// category, if set, adds a boss choice listing that category's bosses.
	category   string
	choiceName string // defaults to "boss"
	choiceDesc string // defaults to "Boss to submit time for"
	exclude    []string

	// bossFor derives the boss from the team size (and raid level) when the
	// command has no boss choice.
	bossFor func(teamSize, raidLevel int) string

	maxPlayers      int // including the submitter; 0 or 1 means solo
	requiredPlayers int // teammates that must be tagged
	raidLevel       bool
	// anyValue takes a time or a number depending on the boss, under a
	// "value" option instead of "time".
	anyValue bool

	validate func(boss string, teamSize int) error
}

var variants = []variant{
	{name: "cox", timeDesc: "CoX pb time", maxPlayers: 8, bossFor: scaled("cox", 1, 2, 3, 5)},
	{name: "cm", timeDesc: "CoX: CM pb time", maxPlayers: 8, bossFor: scaled("cm", 1, 2, 3, 5)},
	{name: "toa", timeDesc: "ToA pb time", maxPlayers: 8, raidLevel: true, bossFor: toa},
	{name: "tob", timeDesc: "Tob pb time", maxPlayers: 5, bossFor: bySize("tob")},
	{name: "hmt", timeDesc: "HMT pb time", maxPlayers: 5, bossFor: bySize("hmt")},
	{name: "nightmare", timeDesc: "Nightmare pb time", maxPlayers: 5, category: "Nightmare", validate: nightmare},
	{name: "titans", timeDesc: "Royal Titans pb time", maxPlayers: 2, requiredPlayers: 1, bossFor: bySize("royal_titans")},
	{name: "yama", timeDesc: "Yama pb time", maxPlayers: 2, requiredPlayers: 1, bossFor: bySize("yama")},
	{name: "dt2", timeDesc: "Desert Treasure II pb time", category: "Desert Treasure II"},
	// royal_titans_2 and yama_2 have their own commands.
	{name: "miscellaneous", timeDesc: "Miscellaneous boss pb time", category: "Miscellaneous", exclude: []string{"royal_titans_2", "yama_2"}},
	{name: "sepulchre", timeDesc: "Hallowed Sepulchre pb time", category: "Sepulchre", choiceName: "floor", choiceDesc: "Floor to submit time for"},
	{name: "slayer", timeDesc: "Slayer pb time", category: "Slayer Boss"},
	{name: "tzhaar", timeDesc: "TzHaar pb time", category: "TzHaar"},
	{name: "quest", timeDesc: "Quest pb time", category: "Quest Bosses"},
	{name: "varlamore", timeDesc: "Time (e.g. 1:23.45) or depth value (e.g. 450)", category: "Varlamore", choiceDesc: "Boss to submit record for", anyValue: true},
}

func (v variant) boss() string {
	if v.choiceName != "" {
		return v.choiceName
	}
	return "boss"
}

func (v variant) value() string {
	if v.anyValue {
		return "value"
	}
	return "time"
}

func (v variant) players() int { return max(v.maxPlayers, 1) }

// bySize names the boss after the team size: tob_3.
func bySize(base string) func(int, int) string {
	return func(n, _ int) string { return fmt.Sprintf("%s_%d", base, n) }
}

// scaled is bySize with only some sizes tracked; others go under "any".
func scaled(base string, sizes ...int) func(int, int) string {
	return func(n, _ int) string {
		for _, s := range sizes {
			if s == n {
				return fmt.Sprintf("%s_%d", base, n)
			}
		}
		return base + "_any"
	}
}

// toa files raids under solo/team and the raid level bracket: toa_team_400.
func toa(n, level int) string {
	size := "team"
	if n == 1 {
		size = "solo"
	}
	bracket := 500
	switch {
	case level < 300:
		bracket = 150
	case level < 400:
		bracket = 300
	case level < 500:
		bracket = 400
	}
	return "toa_" + size + "_" + strconv.Itoa(bracket)
}

func nightmare(boss string, n int) error {
	if n > 1 && (boss == "pnm" || boss == "nm_1") {
		return reply.UserError(str.PBSoloOnlyBoss)
	}
	if boss == "nm_5" && n != 5 {
		return reply.UserError(str.PBInvalidFiveNightmare)
	}
	return nil
}
