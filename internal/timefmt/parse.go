package timefmt

import (
	"errors"
	"fmt"
	"strconv"
	"strings"
)

// ParseTicks parses a PB time ("1:23:45", "12:34" or "12:34.6") into game
// ticks, rounding up like timeToTicks in TS. It replaces the IsValidTime guard,
// whose range checks for hours and fractions never ran.
func ParseTicks(s string) (int, error) {
	ms, err := parseMilliseconds(strings.TrimSpace(s))
	if err != nil {
		return 0, err
	}
	ticks := (ms + Tick - 1) / Tick
	if ticks < 1 {
		return 0, errors.New("Invalid time. It must be longer than 0 seconds.")
	}
	return ticks, nil
}

func parseMilliseconds(s string) (int, error) {
	parts := strings.Split(s, ":")
	if len(parts) < 2 || len(parts) > 3 {
		return 0, formatErr("Expected formats: H:M:S, M:S.Ms or M:S")
	}

	var hours, frac string
	if len(parts) == 3 {
		if strings.Contains(parts[2], ".") {
			return 0, formatErr("Hours and milliseconds cannot coexist.")
		}
		hours = parts[0]
		parts = parts[1:]
	}
	minutes, seconds := parts[0], parts[1]
	if sec, f, ok := strings.Cut(seconds, "."); ok {
		seconds, frac = sec, f
	}

	var errs []error
	h := 0
	if hours != "" {
		h = number(hours, "hours", 23, &errs)
	}
	m := number(minutes, "minutes", 59, &errs)
	sec := number(seconds, "seconds", 59, &errs)

	ms := 0
	if frac != "" {
		if len(frac) > 3 {
			errs = append(errs, formatErr("Expected at most 3 digits after the decimal point."))
		} else {
			// "6" and "60" both mean 600 ms, as in the TS bot.
			ms = number(frac+strings.Repeat("0", 3-len(frac)), "milliseconds", 999, &errs)
		}
	}

	if len(errs) > 0 {
		return 0, errors.Join(errs...)
	}
	return h*hour + m*minute + sec*second + ms, nil
}

func number(s, unit string, max int, errs *[]error) int {
	n, err := strconv.Atoi(s)
	if err != nil {
		*errs = append(*errs, formatErr(fmt.Sprintf("Expected a numeric value for %s.", unit)))
		return 0
	}
	if n < 0 || n > max {
		*errs = append(*errs, fmt.Errorf("Invalid time range. %s fall outside the valid range (0-%d).", capitalizeUnit(unit), max))
	}
	return n
}

func formatErr(msg string) error { return errors.New("Invalid time format. " + msg) }

func capitalizeUnit(s string) string { return strings.ToUpper(s[:1]) + s[1:] }
