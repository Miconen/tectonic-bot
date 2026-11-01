package str

import "fmt"

func PointsGranted(username string, given, oldPoints int, oldIcon string, newPoints int, newIcon string) string {
	sign := ""
	if given > 0 {
		sign = "+"
	}
	return fmt.Sprintf(Check+" **%s** %s%d points (%d %s → %d %s)", username, sign, given, oldPoints, oldIcon, newPoints, newIcon)
}

func RankUp(newIcon, rankName string) string {
	return fmt.Sprintf("Ranked up to %s %s", newIcon, rankName)
}

func RankDown(newIcon, rankName string) string {
	return fmt.Sprintf("Ranked down to %s %s", newIcon, rankName)
}
