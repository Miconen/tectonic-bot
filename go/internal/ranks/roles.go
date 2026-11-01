package ranks

import (
	"context"
	"slices"

	"github.com/disgoorg/disgo/rest"
	"github.com/disgoorg/snowflake/v2"

	"github.com/Miconen/tectonic-bot/go/internal/logging"
)

// RoleEditor is the part of disgo's REST client role syncing needs
// (client.Rest satisfies it); tests can fake it.
type RoleEditor interface {
	AddMemberRole(guildID, userID, roleID snowflake.ID, opts ...rest.RequestOpt) error
	RemoveMemberRole(guildID, userID, roleID snowflake.ID, opts ...rest.RequestOpt) error
}

// Member is the little we need to know about a guild member to sync roles.
type Member struct {
	ID      snowflake.ID
	RoleIDs []snowflake.ID
}

// SyncRoles removes every rank role the member has, then adds the new tier's
// role (syncRankRoles in TS). It's a no-op when no rank has a role.
func SyncRoles(ctx context.Context, r RoleEditor, guildID snowflake.ID, m Member, ranks []Rank, newTier *Rank) error {
	var rankRoles []snowflake.ID
	for _, rank := range ranks {
		if rank.RoleID == nil {
			continue
		}
		if id, err := snowflake.Parse(*rank.RoleID); err == nil {
			rankRoles = append(rankRoles, id)
		}
	}
	if len(rankRoles) == 0 {
		return nil
	}

	for _, id := range rankRoles {
		if slices.Contains(m.RoleIDs, id) {
			if err := r.RemoveMemberRole(guildID, m.ID, id, rest.WithCtx(ctx)); err != nil {
				return err
			}
		}
	}

	if newTier != nil && newTier.RoleID != nil {
		id, err := snowflake.Parse(*newTier.RoleID)
		if err != nil {
			return err
		}
		if err := r.AddMemberRole(guildID, m.ID, id, rest.WithCtx(ctx)); err != nil {
			return err
		}
		logging.Logger(ctx).Info("Assigned rank role", "user", m.ID, "role", id, "tier", newTier.Name)
	}
	return nil
}

// ApplyTransition only touches roles when the tier name changed
// (applyRankTransition in TS).
func ApplyTransition(ctx context.Context, r RoleEditor, guildID snowflake.ID, m Member, ranks []Rank, oldPoints, newPoints int) (Transition, error) {
	t := GetTransition(ranks, oldPoints, newPoints)
	if t.Changed {
		if err := SyncRoles(ctx, r, guildID, m, ranks, t.New); err != nil {
			return t, err
		}
	}
	return t, nil
}
