package event

import (
	"slices"
	"testing"
)

func TestParseUserIDs(t *testing.T) {
	got := ParseUserIDs("<@123456789012345678>, 223456789012345678 <@!123456789012345678> nope 12")
	want := []string{"123456789012345678", "223456789012345678"}
	if !slices.Equal(got, want) {
		t.Errorf("got %v want %v", got, want)
	}
}
