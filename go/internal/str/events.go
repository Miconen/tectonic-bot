package str

import (
	"fmt"
	"strings"

	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
)

// events.*
const (
	EventNotFound          = Cross + " Could not find that event."
	NoLegacyWinners        = Cross + " No valid user IDs or mentions given."
	NoEligibleParticipants = "No eligible participants found for this event."
	PointsHeader           = "\n## Points"
	UnlinkedHeader         = "\n## Unlinked accounts"
	UnlinkInstructions     = "\n_Once you link your rsn to the bot you'll be eligible to gain event points_\n_Please tag leadership to help with linking your account with your rsn_"
)

// EventErrors is eventErrors in TS.
func EventErrors(event, competition string) Overrides {
	o := Overrides{}
	if event != "" {
		o[tectonic.CodeEventNotFound] = fmt.Sprintf("Event **%s** was not found.", event)
		o[tectonic.CodeEventExists] = fmt.Sprintf("Event **%s** is already registered.", event)
	}
	if competition != "" {
		o[tectonic.CodeWomCompetitionNotFound] = fmt.Sprintf("Competition **%s** was not found on Wise Old Man.", competition)
		o[tectonic.CodeEventExists] = fmt.Sprintf("Competition **%s** is already registered as an event.", competition)
	}
	return o
}

func EventInfoHeader(name string) string { return "# " + name }

func EventPlacement(placement int, name string) string {
	return fmt.Sprintf("%d. %s", placement, name)
}

func EventDeleted(name string) string {
	return fmt.Sprintf("%s Deleted event **%s**.", Check, name)
}

func EventRegistered(name string) string {
	return fmt.Sprintf("%s Event **%s** registered and winners recorded.", Check, name)
}

func LegacyEventRegistered(name string, winners []string) string {
	s := "s"
	if len(winners) == 1 {
		s = ""
	}
	return fmt.Sprintf("%s Legacy event **%s** registered with %d winner%s: %s", Check, name, len(winners), s, mentions(winners))
}

func YesNo(b bool) string {
	if b {
		return "yes"
	}
	return "no"
}

// competitions.*
func CompetitionHeader(title string) string { return "## " + title }

func CompetitionCounts(participants, eligible int) string {
	return fmt.Sprintf("Participants: %d\nEligible for points: %d", participants, eligible)
}

func UnlinkedAccount(rsn string, points int) string {
	return fmt.Sprintf("**%s** +%d points, once Discord linked to RSN", rsn, points)
}

func TeamsDesc(n int) string {
	return []string{"Name of the winning team", "Name of the second team", "Name of the third team"}[n-1]
}

// bingo.*
const NotTeamEvent = Cross + " This competition has no teams. Use a team competition."

func BingoSetupComplete(name string) string {
	return "# \U0001F3C6 Bingo Setup Complete\n**" + name + "**"
}

func BingoTeam(team, roleID string, matched, unmatched []string) string {
	lines := []string{fmt.Sprintf("\n**%s** — <@&%s>", team, roleID)}
	if len(matched) > 0 {
		lines = append(lines, Check+" Matched: "+strings.Join(matched, ", "))
	}
	if len(unmatched) > 0 {
		lines = append(lines, Cross+" Unmatched: "+strings.Join(unmatched, ", "))
	}
	return strings.Join(lines, "\n")
}

func CompetitionNotFound(id int) string {
	return fmt.Sprintf("%s Competition **%d** was not found on Wise Old Man.", Cross, id)
}
