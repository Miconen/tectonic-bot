package mw

import (
	"encoding/json"
	"testing"

	"github.com/disgoorg/disgo/discord"
)

func TestOptionValues(t *testing.T) {
	var data discord.SlashCommandInteractionData
	raw := `{
		"id": "1", "name": "moderation", "type": 1,
		"options": [{"name": "points", "type": 2, "options": [{"name": "give", "type": 1, "options": [
			{"name": "username", "type": 6, "value": "42"},
			{"name": "amount", "type": 10, "value": 12.5}
		]}]}],
		"resolved": {"users": {"42": {"id": "42", "username": "zezima"}}}
	}`
	if err := json.Unmarshal([]byte(raw), &data); err != nil {
		t.Fatal(err)
	}

	got := OptionValues(data)
	if got["username"] != "42 (zezima)" || got["amount"] != "12.5" || len(got) != 2 {
		t.Errorf("unexpected options %v", got)
	}
	if data.CommandPath() != "/moderation/points/give" {
		t.Errorf("path %s", data.CommandPath())
	}
	if got := CommandName(data.CommandPath()); got != "moderation points give" {
		t.Errorf("name %s", got)
	}
}
