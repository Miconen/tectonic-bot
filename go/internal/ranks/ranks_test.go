package ranks

import "testing"

func ptr(s string) *string { return &s }

var testRanks = []Rank{
	{Name: "jade", MinPoints: 0, Icon: ptr("J")},
	{Name: "red_topaz", MinPoints: 50, Icon: ptr("R")},
	{Name: "sapphire", MinPoints: 100},
}

func TestTierFor(t *testing.T) {
	cases := map[int]string{0: "jade", 49: "jade", 50: "red_topaz", 1000: "sapphire"}
	for pts, want := range cases {
		if got := TierFor(pts, testRanks); got == nil || got.Name != want {
			t.Errorf("TierFor(%d) = %v, want %s", pts, got, want)
		}
	}
	if TierFor(-1, testRanks) != nil {
		t.Error("expected nil below every tier")
	}
	if TierFor(5, nil) != nil {
		t.Error("expected nil for no ranks")
	}
}

func TestPointsToNext(t *testing.T) {
	if n, ok := PointsToNext(30, testRanks); !ok || n != 20 {
		t.Errorf("got %d %v", n, ok)
	}
	if _, ok := PointsToNext(100, testRanks); ok {
		t.Error("expected no next tier at max")
	}
}

func TestTransition(t *testing.T) {
	tr := GetTransition(testRanks, 40, 60)
	if !tr.Changed || tr.Old.Name != "jade" || tr.New.Name != "red_topaz" {
		t.Errorf("unexpected %+v", tr)
	}
	if GetTransition(testRanks, 10, 20).Changed {
		t.Error("same tier should not change")
	}
	if Icon(TierFor(100, testRanks)) != "" || Icon(nil) != "" {
		t.Error("nil icon should be empty")
	}
}
