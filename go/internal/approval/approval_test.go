package approval

import (
	"testing"
	"time"
)

func TestTimeAgo(t *testing.T) {
	cases := map[time.Duration]string{
		10 * time.Second:           "just now",
		time.Minute:                "1 minute ago",
		5 * time.Minute:            "5 minutes ago",
		time.Hour:                  "1 hour ago",
		2*time.Hour + time.Minute:  "2 hours and 1 minute ago",
		time.Hour + 30*time.Minute: "1 hour and 30 minutes ago",
	}
	for d, want := range cases {
		if got := TimeAgo(d); got != want {
			t.Errorf("TimeAgo(%v) = %q, want %q", d, got, want)
		}
	}
}

func TestClaim(t *testing.T) {
	s := New()
	s.pending["1"] = &pending{id: "1", guildID: 10}

	if _, err := s.claim("1", 99); err == nil {
		t.Error("another guild must not see the request")
	}
	p, err := s.claim("1", 10)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := s.claim("1", 10); err == nil {
		t.Error("second moderator should be told it's in progress")
	}
	s.release(p, false)
	if _, err := s.claim("1", 10); err != nil {
		t.Errorf("released request should be claimable again: %v", err)
	}
	s.release(p, true)
	if _, err := s.claim("1", 10); err == nil {
		t.Error("finished request should be gone")
	}
}
