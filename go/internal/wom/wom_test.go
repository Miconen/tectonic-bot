package wom

import (
	"context"
	"net/http"
	"net/http/httptest"
	"slices"
	"testing"
)

func TestTeams(t *testing.T) {
	calls := 0
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		calls++
		if r.URL.Path != "/competitions/7" {
			t.Errorf("path %s", r.URL.Path)
		}
		w.Write([]byte(`{"participations":[{"teamName":"Zebras"},{"teamName":"Ants"},{"teamName":null},{"teamName":"Zebras"}]}`))
	}))
	defer srv.Close()

	c := New()
	c.base = srv.URL + "/"
	for range 2 {
		got, err := c.Teams(context.Background(), 7)
		if err != nil {
			t.Fatal(err)
		}
		if !slices.Equal(got, []string{"Ants", "Zebras"}) {
			t.Fatalf("got %v", got)
		}
	}
	if calls != 1 {
		t.Errorf("expected 1 call (cached), got %d", calls)
	}
}
