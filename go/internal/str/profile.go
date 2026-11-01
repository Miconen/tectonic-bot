package str

import (
	"fmt"
	"strings"
)

const (
	ProfileCriticalError      = Cross + " Error fetching user data."
	ProfileAccountsHeader     = "## Accounts"
	ProfilePBsHeader          = "## Clan PBs"
	ProfileEventsHeader       = "## Event Placements"
	ProfileAchievementsHeader = "## Achievements"
	ProfileEventWinnerChunk   = "**Winner**"
)

type ProfileHeaderArgs struct {
	RankIcon     string
	Username     string
	RankPrefix   string
	Points       int
	PBCount      int
	EventCount   int
	NextRankIcon string
	PointsToNext string
}

func ProfileHeader(a ProfileHeaderArgs) string {
	parts := []string{"Rank: " + a.RankPrefix, fmt.Sprintf("Points: %d", a.Points)}
	if a.PBCount > 0 {
		parts = append(parts, fmt.Sprintf("PBs: %d", a.PBCount))
	}
	if a.EventCount > 0 {
		parts = append(parts, fmt.Sprintf("Events: %d", a.EventCount))
	}
	return fmt.Sprintf("# %s %s\n-# %s\n%s Points to next level: %s",
		a.RankIcon, a.Username, strings.Join(parts, " | "), a.NextRankIcon, a.PointsToNext)
}

func ProfileAccountEntry(rsn string) string {
	return "`" + rsn + "`"
}

func ProfilePBEntry(position, category, displayName, displayValue string) string {
	return fmt.Sprintf("**#%s** in **%s** `%s` - `%s`", position, category, displayName, displayValue)
}

func ProfileEventPlacementChunk(placement int) string {
	return fmt.Sprintf("**#%d**", placement)
}

func ProfileEventEntry(chunk, eventName, womID string) string {
	if strings.HasPrefix(womID, "legacy_") {
		return fmt.Sprintf("%s in **%s**", chunk, eventName)
	}
	return fmt.Sprintf("%s in **[%s](<https://wiseoldman.net/competitions/%s>)**", chunk, eventName, womID)
}

func ProfileAchievementEntry(icon, name string) string {
	return fmt.Sprintf("%s - **%s**", icon, name)
}
