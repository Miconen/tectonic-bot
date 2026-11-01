package tectonic

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/Miconen/tectonic-bot/go/internal/logging"
)

func newTestServer(t *testing.T, h http.HandlerFunc) *Client {
	t.Helper()
	srv := httptest.NewServer(h)
	t.Cleanup(srv.Close)
	return New(srv.URL, "secret")
}

func TestGetUser(t *testing.T) {
	c := newTestServer(t, func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "secret" {
			t.Errorf("missing auth header")
		}
		if r.URL.Path != "/api/v1/guilds/1/users/rsn/Zezima" {
			t.Errorf("unexpected path %s", r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`[{"user_id":"42","guild_id":"1","points":120,"rank":3,"rsns":[{"rsn":"Zezima","wom_id":"7"}],"extra":"kept"}]`))
	})

	u, err := c.GetUser(context.Background(), "1", ByRSN("Zezima"))
	if err != nil {
		t.Fatal(err)
	}
	if u.UserID != "42" || u.Points != 120 || len(u.RSNs) != 1 {
		t.Errorf("unexpected user %+v", u)
	}
	if !strings.Contains(string(u.Raw), `"extra":"kept"`) {
		t.Errorf("raw payload not kept: %s", u.Raw)
	}
}

func TestSendsRequestID(t *testing.T) {
	var got string
	c := newTestServer(t, func(w http.ResponseWriter, r *http.Request) {
		got = r.Header.Get("X-Request-ID")
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`[]`))
	})

	ctx := logging.WithID(context.Background(), "1234567890")
	c.GetUser(ctx, "1", ByUserID("42"))
	if got != "1234567890" {
		t.Errorf("X-Request-ID = %q", got)
	}

	c.GetUser(context.Background(), "1", ByUserID("42"))
	if got != "" {
		t.Errorf("no ID in context should send no header, got %q", got)
	}
}

func TestGetUserEmpty(t *testing.T) {
	c := newTestServer(t, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`[]`))
	})
	u, err := c.GetUser(context.Background(), "1", ByUserID("42"))
	if err != nil || u != nil {
		t.Fatalf("want nil, nil; got %v, %v", u, err)
	}
}

func TestTectonicError(t *testing.T) {
	c := newTestServer(t, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte(`{"code":1012,"message":"User not found"}`))
	})
	_, err := c.GetUser(context.Background(), "1", ByUserID("42"))

	var apiErr *APIError
	if !errors.As(err, &apiErr) || apiErr.Code != CodeUserNotFound || apiErr.Message != "User not found" {
		t.Fatalf("unexpected error %#v", err)
	}
	if !errors.Is(err, ErrNotFound) {
		t.Error("404 should match ErrNotFound")
	}
}

func TestRFC7807Error(t *testing.T) {
	c := newTestServer(t, func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/problem+json")
		w.WriteHeader(http.StatusUnprocessableEntity)
		w.Write([]byte(`{"status":422,"title":"Unprocessable Entity","detail":"validation failed","errors":[{"message":"a"},{"message":"b"}]}`))
	})
	_, err := c.GivePoints(context.Background(), "1", []string{"2", "3"}, CustomPoints(2))

	var apiErr *APIError
	if !errors.As(err, &apiErr) || apiErr.Code != CodeUnknown || apiErr.Message != "a, b" {
		t.Fatalf("unexpected error %#v", err)
	}
}

func TestGivePointsPath(t *testing.T) {
	var got string
	c := newTestServer(t, func(w http.ResponseWriter, r *http.Request) {
		got = r.Method + " " + r.URL.Path
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`[]`))
	})
	ctx := context.Background()

	c.GivePoints(ctx, "1", []string{"2", "3"}, CustomPoints(10))
	if got != "PUT /api/v1/guilds/1/users/2,3/points/custom/10" {
		t.Errorf("custom: %s", got)
	}
	c.GivePoints(ctx, "1", []string{"2"}, PresetPoints("split_low"))
	if got != "PUT /api/v1/guilds/1/users/2/points/split_low" {
		t.Errorf("preset: %s", got)
	}
}

func TestHealthy(t *testing.T) {
	calls := 0
	c := newTestServer(t, func(w http.ResponseWriter, r *http.Request) {
		calls++
		if r.URL.Path != "/openapi.json" {
			t.Errorf("unexpected path %s", r.URL.Path)
		}
		w.Header().Set("Content-Type", "application/openapi+json")
		w.Write([]byte(`{}`))
	})
	ctx := context.Background()
	if !c.Healthy(ctx) || !c.Healthy(ctx) {
		t.Fatal("expected healthy")
	}
	if calls != 1 {
		t.Errorf("health result should be cached, got %d calls", calls)
	}
}
