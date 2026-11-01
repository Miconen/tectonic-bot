package timefmt

import "testing"

func TestTicksToTime(t *testing.T) {
	cases := map[int]string{
		0:    "00.00",
		1:    "00.60",
		100:  "01:00.00",
		101:  "01:00.60",
		6000: "01:00:00.00",
		55:   "33.00",
	}
	for ticks, want := range cases {
		if got := TicksToTime(ticks); got != want {
			t.Errorf("TicksToTime(%d) = %q, want %q", ticks, got, want)
		}
	}
}

func TestMillisecondsToTimeSmallFraction(t *testing.T) {
	// TS: (5).toString().padStart(2, "0").slice(0, 2) === "05"
	if got := MillisecondsToTime(1005); got != "01.05" {
		t.Errorf("got %q", got)
	}
	// TS: (123).toString().padStart(2, "0").slice(0, 2) === "12"
	if got := MillisecondsToTime(1123); got != "01.12" {
		t.Errorf("got %q", got)
	}
}
