package str

import "fmt"

const (
	PBNotNewRecord         = "Time submitted, not a new pb :)"
	PBFailedUpdatingEmbed  = "Failed to update the leaderboard embed. The time was saved but the display may be out of date."
	PBSoloOnlyBoss         = "Selected boss can't include more than one player."
	PBInvalidFiveNightmare = "Invalid amount of players for 5-man nightmare."
	PBDuplicatePlayers     = "Each player can only be listed once."
	PBNoRecordYet          = "`No record yet`"
	PBUnknownBoss          = "That boss isn't available for PB submissions."
)

func PBRequestSubmitted(bossTitle, valueLabel, displayValue, sourceName string, points int, preview string) string {
	return fmt.Sprintf("# PB Request: %s\n`%s: %s`\n-# %s | %d points\n\n%s", bossTitle, valueLabel, displayValue, sourceName, points, preview)
}

func PBDenied(bossTitle, sourceName string, points int) string {
	return fmt.Sprintf("# PB Denied: %s\n-# %s | %d points\n", bossTitle, sourceName, points)
}

func PBNotFaster(valueLabel, value, cutoff string) string {
	return fmt.Sprintf("%s Your %s of `%s` would not make the top positions. Current cutoff: `%s`.", Cross, valueLabel, value, cutoff)
}

func PBNew(position int, bossTitle, valueLabel, displayValue, sourceName string, points int) string {
	return fmt.Sprintf("# New #%d: %s\n`%s: %s`\n-# %s | %d points\n", position, bossTitle, valueLabel, displayValue, sourceName, points)
}

func PBInvalidValue(valueLabel string) string {
	return fmt.Sprintf("Invalid value. Expected a positive whole number for %s.", valueLabel)
}

func PBNeedsPlayers(n int) string {
	return fmt.Sprintf("This boss needs exactly %d players.", n)
}

func PBPointsFailed(reason string) string {
	return "Points could not be awarded, give them with `/moderation points source`: " + reason
}

// times.*
const (
	TimesNoBoards       = "This server has no leaderboard categories to post."
	TimesBoardsCreated  = Check + " Leaderboard embeds posted in this channel. New PBs will update them."
	TimesEmbedsNotSaved = "The embeds were posted but couldn't be saved, so they won't update. Try again."
)

func RecordRemoved(recordID int, label string) string {
	return fmt.Sprintf("%s Removed record `#%d` (%s).", Check, recordID, label)
}

func RecordNotFound(recordID string) string {
	return fmt.Sprintf("%s Record `#%s` was not found.", Cross, recordID)
}

func TeammateAdded(user, boss string) string {
	return fmt.Sprintf("%s Added **%s** to the team for the **%s** clan PB.", Check, user, boss)
}

func TeammateRemoved(user, boss string) string {
	return fmt.Sprintf("%s Removed **%s** from the team for the **%s** clan PB.", Check, user, boss)
}
