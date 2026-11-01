// Package str holds every user-facing string, replacing src/utils/stringRepo.ts.
//
// Static strings are constants and templates are typed functions, so a missing
// argument is a compile error instead of "[category.key:missing-args]" at
// runtime. Only the strings used by the demo commands are ported so far.
package str

import "strings"

// capitalize upper-cases the first letter (capitalizeFirstLetter in TS).
func capitalize(s string) string {
	if s == "" {
		return s
	}
	return strings.ToUpper(s[:1]) + s[1:]
}

// DisplayName replaces underscores with spaces and capitalizes the first
// letter (formatDisplayName in TS).
func DisplayName(s string) string {
	return capitalize(strings.ReplaceAll(s, "_", " "))
}
