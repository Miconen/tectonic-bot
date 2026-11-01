package timefmt

import (
	"strings"
	"testing"
)

func TestParseTicks(t *testing.T) {
	ok := map[string]int{
		"1:00":     100,
		"0:01":     2, // 1000 ms -> 1.67 ticks, rounded up
		"1:23.40":  139,
		"1:23.4":   139,
		"1:23.400": 139,
		"12:34.6":  1258,
		"1:00:00":  6000,
		" 2:00 ":   200,
	}
	for in, want := range ok {
		got, err := ParseTicks(in)
		if err != nil || got != want {
			t.Errorf("ParseTicks(%q) = %d, %v; want %d", in, got, err, want)
		}
	}

	bad := map[string]string{
		"83":        "Expected formats",
		"1:2:3:4":   "Expected formats",
		"1:00:00.5": "cannot coexist",
		"a:00":      "numeric value for minutes",
		"1:60":      "Seconds fall outside",
		"60:00":     "Minutes fall outside",
		"24:00:00":  "Hours fall outside",
		"1:00.1234": "at most 3 digits",
		"0:00":      "longer than 0",
		"1:x.5":     "numeric value for seconds",
	}
	for in, wantSub := range bad {
		_, err := ParseTicks(in)
		if err == nil || !strings.Contains(err.Error(), wantSub) {
			t.Errorf("ParseTicks(%q) error = %v, want it to mention %q", in, err, wantSub)
		}
	}
}
