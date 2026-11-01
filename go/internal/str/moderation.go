package str

import (
	"fmt"
	"strings"

	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
)

// moderation.*
const (
	GuildInitialized = Check + " Guild initialized successfully."
	NoRankTiers      = "No rank tiers configured."
	RankTiersHeader  = "## Guild Rank Tiers"
	NothingToUpdate  = "Nothing to update: pick at least one option to change."
	NotSet           = "not set"
)

// Change is one setting going From -> To.
type Change struct {
	Field, From, To string
}

// Updated renders setting changes the same way everywhere (#145):
//
//	√ Settings updated
//	**Mod channel**: #old → #new
func Updated(what string, changes ...Change) string {
	lines := []string{fmt.Sprintf("%s %s updated", Check, what)}
	for _, c := range changes {
		lines = append(lines, fmt.Sprintf("**%s**: %s → %s", c.Field, c.From, c.To))
	}
	return strings.Join(lines, "\n")
}

func ChannelMention(id *string) string {
	if id == nil {
		return NotSet
	}
	return "<#" + *id + ">"
}

func RoleMention(id *string) string {
	if id == nil {
		return NotSet
	}
	return "<@&" + *id + ">"
}

func Positions(n int) string {
	if n == 1 {
		return "1 position"
	}
	return fmt.Sprintf("%d positions", n)
}

func RankTierLine(icon, name string, minPoints int, roleID *string) string {
	line := strings.TrimSpace(fmt.Sprintf("%s **%s** — %d points", icon, DisplayName(name), minPoints))
	if roleID != nil {
		line += " | <@&" + *roleID + ">"
	}
	return line
}

func RankCreated(name string, minPoints int) string {
	return fmt.Sprintf("%s Rank **%s** created (%d points).", Check, DisplayName(name), minPoints)
}

func RankDeleted(name string) string {
	return fmt.Sprintf("%s Rank **%s** deleted.", Check, DisplayName(name))
}

func RankChoice(icon, name string, minPoints int) string {
	return strings.TrimSpace(fmt.Sprintf("%s %s — %d pts", icon, DisplayName(name), minPoints))
}

// RankErrors is rankErrors in TS.
func RankErrors(rank string) Overrides {
	return Overrides{
		tectonic.CodeGuildRankNotFound: fmt.Sprintf("Rank **%s** was not found.", rank),
		tectonic.CodeGuildRankExists:   fmt.Sprintf("Rank **%s** already exists.", rank),
	}
}

// accounts.*
func Activated(user, by string) string {
	return fmt.Sprintf("%s **%s** has been activated and linked by **%s**.", Check, user, by)
}

func Deactivated(username string) string {
	return fmt.Sprintf("%s **%s** has been deactivated.", Check, username)
}

func RSNListHeader(username string) string { return "## " + username + " RSNs" }

func RSNAdded(rsn, username string) string {
	return fmt.Sprintf("%s Added RSN **%s** to **%s**.", Check, rsn, username)
}

func RSNRemoved(rsn, username string) string {
	return fmt.Sprintf("%s Removed RSN **%s** from **%s**.", Check, rsn, username)
}

func NoRoleMembers(role string) string {
	return fmt.Sprintf("Nobody in **%s** is activated, so no points were given.", role)
}

func RoleWarning(err error) string {
	return fmt.Sprintf("-# Rank roles could not be updated: %v", err)
}

const NotInServer = Cross + " That user is not a member of this server."
