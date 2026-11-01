package team

import (
	"encoding/json"
	"testing"

	"github.com/disgoorg/disgo/discord"
)

func slash(t *testing.T, players string) discord.SlashCommandInteractionData {
	t.Helper()
	var data discord.SlashCommandInteractionData
	raw := `{"id":"1","name":"pb","type":1,"options":[{"name":"cox","type":1,"options":[` + players + `]}],
		"resolved":{"users":{"2":{"id":"2","username":"two"},"3":{"id":"3","username":"three"},"1":{"id":"1","username":"me"}},
		"members":{"2":{"nick":"Second"}}}}`
	if err := json.Unmarshal([]byte(raw), &data); err != nil {
		t.Fatal(err)
	}
	return data
}

func invoker() discord.ResolvedMember {
	return discord.ResolvedMember{Member: discord.Member{User: discord.User{ID: 1, Username: "me"}}}
}

func TestFromInteraction(t *testing.T) {
	data := slash(t, `{"name":"player2","type":6,"value":"2"},{"name":"player4","type":6,"value":"3"}`)
	players, err := FromInteraction(data, invoker(), 8)
	if err != nil {
		t.Fatal(err)
	}
	if len(players) != 3 || players[1].Name != "Second" || players[2].ID != "3" {
		t.Errorf("unexpected players %+v", players)
	}
}

func TestDuplicatePlayers(t *testing.T) {
	for name, opts := range map[string]string{
		"same teammate twice": `{"name":"player2","type":6,"value":"2"},{"name":"player3","type":6,"value":"2"}`,
		"tagging yourself":    `{"name":"player2","type":6,"value":"1"}`,
	} {
		if _, err := FromInteraction(slash(t, opts), invoker(), 8); err == nil {
			t.Errorf("%s: expected an error", name)
		}
	}
}

func TestPlayerOptions(t *testing.T) {
	opts := PlayerOptions(4, 1)
	if len(opts) != 3 {
		t.Fatalf("got %d options", len(opts))
	}
	if !opts[0].(discord.ApplicationCommandOptionUser).Required || opts[1].(discord.ApplicationCommandOptionUser).Required {
		t.Error("only player2 should be required")
	}
	if len(PlayerOptions(1, 0)) != 0 {
		t.Error("solo commands have no teammate options")
	}
}
