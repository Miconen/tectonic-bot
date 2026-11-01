package str

import (
	"fmt"
	"strings"

	"github.com/Miconen/tectonic-bot/go/internal/tectonic"
)

// splits.*

func SplitRequestSubmitted(sourceName string, points int, username string, partners []string, preview string) string {
	with := ""
	if len(partners) > 0 {
		with = "**Split with:** " + mentions(partners)
	}
	return fmt.Sprintf("# Split Request\n-# %s | %d points\n\n**%s** has submitted a split request.\n%s\n\n%s", sourceName, points, username, with, preview)
}

func SplitApproved(sourceName string, points int) string {
	return fmt.Sprintf("# Split Approved\n-# %s | %d points\n", sourceName, points)
}

func SplitDenied(sourceName string, points int, username string) string {
	return fmt.Sprintf("# Split Denied\n-# %s | %d points\n\n%s **%s**'s split request was denied.", sourceName, points, Cross, username)
}

// ca.*

const CAAllAlreadyCompleted = Cross + " All players have already completed this combat achievement."

func CARequestSubmitted(caName, requester, sourceName string, points int, already, fresh []string, preview string) string {
	alreadyText := "None"
	if len(already) > 0 {
		alreadyText = mentions(already)
	}
	return fmt.Sprintf("# Combat Achievement Request\n-# %s | %d points\n\n**%s** has submitted a CA request.\n**Achievement:** %s\n**Already completed:** %s\n**New completers:** %s\n\n%s",
		sourceName, points, requester, caName, alreadyText, mentions(fresh), preview)
}

func CAApproved(sourceName string, points int) string {
	return fmt.Sprintf("# Combat Achievement Approved\n-# %s | %d points\n", sourceName, points)
}

func CADenied(sourceName string, points int, caName string) string {
	return fmt.Sprintf("# Combat Achievement Denied\n-# %s | %d points\n\n%s CA request for **%s** was denied.", sourceName, points, Cross, caName)
}

func CANameNotFound(caName string) string {
	return fmt.Sprintf("Couldn't find combat achievement: `%s`\nPlease try submitting again.", caName)
}

func CAGranted(caName, username string) string {
	return fmt.Sprintf("%s Granted combat achievement **%s** to **%s**.", Check, caName, username)
}

func CARemoved(caName, username string) string {
	return fmt.Sprintf("%s Removed combat achievement **%s** from **%s**.", Check, caName, username)
}

// achievements.*

func AchievementRequestSubmitted(achievement, username string) string {
	return fmt.Sprintf("# Achievement Request\n-# %s\n\n**%s** has submitted an achievement request.", achievement, username)
}

func AchievementApproved(achievement string) string {
	return fmt.Sprintf("# Achievement Approved\n-# %s\n", achievement)
}

func AchievementDenied(achievement, username string) string {
	return fmt.Sprintf("# Achievement Denied\n-# %s\n\n%s **%s**'s achievement request was denied.", achievement, Cross, username)
}

func AchievementGranted(achievement, username string) string {
	return fmt.Sprintf("%s Granted achievement **%s** to **%s**.", Check, achievement, username)
}

func AchievementRemoved(achievement, username string) string {
	return fmt.Sprintf("%s Removed achievement **%s** from **%s**.", Check, achievement, username)
}

func AchievementAlreadyHas(username, achievement string) string {
	return fmt.Sprintf("%s **%s** already has achievement **%s**.", Cross, username, achievement)
}

func AchievementUnknown(achievement string) string {
	return fmt.Sprintf("%s Achievement **%s** not found.", Cross, achievement)
}

// AchievementErrors is achievementErrors in TS.
func AchievementErrors(username, achievement string) Overrides {
	return Overrides{
		tectonic.CodeAchievementNotFound:     fmt.Sprintf("Achievement **%s** was not found.", achievement),
		tectonic.CodeAchievementExists:       fmt.Sprintf("Achievement **%s** already exists.", achievement),
		tectonic.CodeUserAchievementNotFound: fmt.Sprintf("**%s** does not have achievement **%s**.", username, achievement),
		tectonic.CodeUserAchievementExists:   fmt.Sprintf("**%s** already has achievement **%s**.", username, achievement),
	}
}

// CombatAchievementErrors is combatAchievementErrors in TS.
func CombatAchievementErrors(achievement string) Overrides {
	return Overrides{
		tectonic.CodeCombatAchievementNotFound: fmt.Sprintf("Combat achievement **%s** was not found.", achievement),
		tectonic.CodeCombatAchievementExists:   fmt.Sprintf("Combat achievement **%s** already exists.", achievement),
	}
}

func mentions(ids []string) string {
	m := make([]string, len(ids))
	for i, id := range ids {
		m[i] = "<@" + id + ">"
	}
	return strings.Join(m, ", ")
}
