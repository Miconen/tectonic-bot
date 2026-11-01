package points

import (
	"testing"

	"github.com/Miconen/tectonic-bot/go/internal/ranks"
)

func ptr(s string) *string { return &s }

func TestFormatAward(t *testing.T) {
	jade := &ranks.Rank{Name: "jade", Icon: ptr("<J>")}
	redTopaz := &ranks.Rank{Name: "red_topaz", MinPoints: 50, Icon: ptr("<R>")}
	noIcon := &ranks.Rank{Name: "sapphire", MinPoints: 100}

	cases := []struct {
		name  string
		given int
		total int
		t     ranks.Transition
		want  string
	}{
		{"same tier", 10, 30, ranks.Transition{Old: jade, New: jade}, "√ **Zez** +10 points (20 <J> → 30 <J>)"},
		{"rank up", 30, 60, ranks.Transition{Old: jade, New: redTopaz, Changed: true}, "√ **Zez** +30 points (30 <J> → 60 <R>)\nRanked up to <R> Red topaz"},
		{"rank down", -30, 40, ranks.Transition{Old: redTopaz, New: jade, Changed: true}, "√ **Zez** -30 points (70 <R> → 40 <J>)\nRanked down to <J> Jade"},
		{"new tier without icon keeps old icon", 50, 110, ranks.Transition{Old: redTopaz, New: noIcon, Changed: true}, "√ **Zez** +50 points (60 <R> → 110 <R>)\nRanked up to  Sapphire"},
		{"no ranks", 5, 5, ranks.Transition{}, "√ **Zez** +5 points (0  → 5 )"},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			if got := FormatAward("Zez", c.given, c.total, c.t); got != c.want {
				t.Errorf("got %q, want %q", got, c.want)
			}
		})
	}
}
