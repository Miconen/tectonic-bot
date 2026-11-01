package preview

import (
	"testing"

	"github.com/Miconen/tectonic-bot/go/internal/ranks"
	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
)

func TestRender(t *testing.T) {
	icon := func(s string) *string { return &s }
	rankList := []ranks.Rank{{Name: "jade", MinPoints: 0, Icon: icon("J")}, {Name: "red_topaz", MinPoints: 50, Icon: icon("R")}}
	users := []tectonic.DetailedUser{{UserID: "1", Points: 40}, {UserID: "2", Points: 0}}

	got := Render([]string{"1", "2", "3"}, users, rankList, 20)
	want := "**If approved:**\n" +
		"<@1> (40 J → 60 R) Ranks up to R Red topaz\n" +
		"<@2> (0 J → 20 J)\n" +
		"<@3>"
	if got != want {
		t.Errorf("got\n%s\nwant\n%s", got, want)
	}
}
