// Package team collects the players of a team submission and checks they're
// activated (replacing the IsActivated guard and the per-command team arrays).
package team

import (
	"context"
	"errors"
	"fmt"

	"github.com/disgoorg/disgo/discord"

	"github.com/Miconen/tectonic-bot/go/internal/reply"
	"github.com/Miconen/tectonic-bot/go/internal/str"
	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
)

// Player is a team member as resolved from the interaction.
type Player struct {
	ID   string
	Name string
}

// PlayerOption is the name of the n-th teammate option ("player2"...).
func PlayerOption(n int) string { return fmt.Sprintf("player%d", n) }

// PlayerOptions builds options player2..playerN. The first `required` of
// them are required.
func PlayerOptions(max, required int) []discord.ApplicationCommandOption {
	var opts []discord.ApplicationCommandOption
	for n := 2; n <= max; n++ {
		opts = append(opts, discord.ApplicationCommandOptionUser{
			Name:        PlayerOption(n),
			Description: "Teammate discord @name",
			Required:    n-1 <= required,
		})
	}
	return opts
}

// FromInteraction returns the invoker followed by every tagged teammate.
// Listing someone twice (including yourself) is an error: the TS bot counted
// duplicates towards the team size and filed the PB under the wrong scale.
func FromInteraction(data discord.SlashCommandInteractionData, invoker discord.ResolvedMember, max int) ([]Player, error) {
	players := []Player{{ID: invoker.User.ID.String(), Name: invoker.EffectiveName()}}
	seen := map[string]bool{players[0].ID: true}

	for n := 2; n <= max; n++ {
		u, ok := data.OptUser(PlayerOption(n))
		if !ok {
			continue
		}
		id := u.ID.String()
		if seen[id] {
			return nil, reply.UserError(str.PBDuplicatePlayers)
		}
		seen[id] = true

		name := u.EffectiveName()
		if m, ok := data.OptMember(PlayerOption(n)); ok && m.Nick != nil {
			name = *m.Nick
		}
		players = append(players, Player{ID: id, Name: name})
	}
	return players, nil
}

// IDs returns the players' user IDs.
func IDs(players []Player) []string {
	ids := make([]string, len(players))
	for i, p := range players {
		ids[i] = p.ID
	}
	return ids
}

// RequireActivated fails with a list of every player who isn't activated.
func RequireActivated(ctx context.Context, api *tectonic.Client, guildID string, players []Player) error {
	users, err := api.GetBasicUsers(ctx, guildID, IDs(players))
	if errors.Is(err, tectonic.ErrNotFound) {
		users, err = nil, nil // nobody is activated
	}
	if err != nil {
		return reply.WithOverrides(err, str.AccountErrors(str.AccountArgs{}))
	}
	active := map[string]bool{}
	for _, u := range users {
		active[u.UserID] = true
	}

	var missing []string
	for _, p := range players {
		if !active[p.ID] {
			missing = append(missing, p.Name)
		}
	}
	if len(missing) > 0 {
		return reply.UserError(str.NotActivatedPlayers(missing))
	}
	return nil
}
