package str

import "fmt"

const (
	RequestNotFound  = "This request has expired or the bot has restarted. Please ask for a new request, or handle points manually."
	RequestInProcess = "Another moderator is already handling this request."
	ScreenshotFailed = "Couldn't read the screenshot. Please try uploading it again."
)

func RequestApproved(link string) string {
	return fmt.Sprintf("%s Request approved. [Jump to message](%s)", Check, link)
}

func RequestDenied(link string) string {
	return fmt.Sprintf("%s Request denied. [Jump to message](%s)", Cross, link)
}

func RequestApproveFailed(reason string) string {
	return fmt.Sprintf("%s Failed to approve request:\n%s", Cross, reason)
}

// PreviewHeader starts the "If approved:" block of a request.
const PreviewHeader = "**If approved:**"

func PreviewUnknown(userID string) string { return "<@" + userID + ">" }

func PreviewLine(userID string, oldPoints int, oldIcon string, newPoints int, newIcon string) string {
	return fmt.Sprintf("<@%s> (%d %s → %d %s)", userID, oldPoints, oldIcon, newPoints, newIcon)
}

func PreviewRankChange(up bool, icon, rankName string) string {
	dir := "Ranks down"
	if up {
		dir = "Ranks up"
	}
	return fmt.Sprintf(" %s to %s %s", dir, icon, rankName)
}

func NotActivatedPlayers(names []string) string {
	out := "Command failed: "
	for _, n := range names {
		out += fmt.Sprintf("%s **%s** is not activated.\n", Cross, n)
	}
	return out
}
