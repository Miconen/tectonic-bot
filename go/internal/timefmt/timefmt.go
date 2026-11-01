// Package timefmt formats OSRS game-tick durations, ported from the TS
// bot's TimeConverter.
package timefmt

import "fmt"

const (
	hour   = 3_600_000
	minute = 60_000
	second = 1_000
	// Tick is one game tick in milliseconds.
	Tick = 600
)

// TicksToTime formats a tick count as [hh:]mm:ss.cc / ss.cc.
func TicksToTime(ticks int) string {
	return MillisecondsToTime(ticks * Tick)
}

// MillisecondsToTime mirrors the TS implementation exactly, including how it
// renders the sub-second part (first two digits of the millisecond count,
// zero-padded to two).
func MillisecondsToTime(ms int) string {
	h := ms / hour
	rem := ms % hour
	m := rem / minute
	rem %= minute
	s := rem / second
	rem %= second

	frac := fmt.Sprintf("%02d", rem)[:2]

	switch {
	case h > 0:
		return fmt.Sprintf("%02d:%02d:%02d.%s", h, m, s, frac)
	case m > 0:
		return fmt.Sprintf("%02d:%02d.%s", m, s, frac)
	default:
		return fmt.Sprintf("%02d.%s", s, frac)
	}
}
