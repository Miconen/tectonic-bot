package moderation

import (
	"slices"
	"testing"

	"github.com/Miconen/tectonic-bot/internal/tectonic"
)

func TestUnlinkedAccounts(t *testing.T) {
	participants := []tectonic.DetailedUser{{RSNs: []tectonic.RSN{{RSN: "Zezima", WomID: "1"}}}}
	accounts := []tectonic.RSN{{RSN: "Zezima", WomID: "1"}, {RSN: "Lynx Titan", WomID: "2"}}
	if got := unlinkedAccounts(participants, accounts); !slices.Equal(got, []string{"Lynx Titan"}) {
		t.Errorf("got %v", got)
	}
}
