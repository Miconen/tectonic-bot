// Package tectonic is a typed client for tectonic-api, replacing
// src/requests/* in the TS bot.
package tectonic

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/Miconen/tectonic-bot/go/internal/logging"
)

type Client struct {
	rootURL string
	apiURL  string
	authKey string
	http    *http.Client

	healthMu      sync.Mutex
	healthy       bool
	healthChecked time.Time
}

// New creates a client. rootURL is the API host root, e.g.
// "http://localhost:8080/".
func New(rootURL, authKey string) *Client {
	if !strings.HasSuffix(rootURL, "/") {
		rootURL += "/"
	}
	return &Client{
		rootURL: rootURL,
		apiURL:  rootURL + "api/v1/",
		authKey: authKey,
		http:    &http.Client{Timeout: 15 * time.Second},
	}
}

// do performs a request against base+path and decodes a JSON response into
// out (which may be nil). It returns the raw body for callers that need it.
func (c *Client) do(ctx context.Context, method, base, path string, out any) ([]byte, error) {
	log := logging.Logger(ctx).With("endpoint", base+path, "method", method)
	log.Info("API request")

	req, err := http.NewRequestWithContext(ctx, method, base+path, nil)
	if err != nil {
		return nil, &APIError{Code: CodeUnknown, Message: err.Error()}
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", c.authKey)
	// Lets the API tag its logs with the same ID the user sees (#171).
	if id := logging.CorrelationID(ctx); id != "" {
		req.Header.Set("X-Request-ID", id)
	}

	res, err := c.http.Do(req)
	if err != nil {
		log.Error("API network error", "err", err)
		return nil, &APIError{Status: http.StatusInternalServerError, Code: CodeUnknown, Message: err.Error()}
	}
	defer res.Body.Close()

	if res.StatusCode == http.StatusNoContent {
		log.Info("API success (no content)")
		return nil, nil
	}

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, &APIError{Status: res.StatusCode, Code: CodeUnknown, Message: err.Error()}
	}

	ct := res.Header.Get("Content-Type")
	if !strings.Contains(ct, "json") {
		return nil, &APIError{Status: res.StatusCode, Code: CodeUnknown, Message: fmt.Sprintf("Unsupported Content-Type %q", ct)}
	}

	if res.StatusCode >= 400 {
		apiErr := decodeError(res.StatusCode, body)
		log.Error("API error", "status", apiErr.Status, "code", apiErr.Code, "message", apiErr.Message)
		return nil, apiErr
	}

	if out != nil {
		if err := json.Unmarshal(body, out); err != nil {
			return nil, &APIError{Status: res.StatusCode, Code: CodeUnknown, Message: "Failed to parse JSON response"}
		}
	}
	log.Info("API success", "status", res.StatusCode)
	return body, nil
}

func call[T any](ctx context.Context, c *Client, method, path string) (T, error) {
	var out T
	_, err := c.do(ctx, method, c.apiURL, path, &out)
	return out, err
}

// Healthy reports whether the API answers, caching the result for 30 seconds
// (same as src/health/healthcheck.ts).
func (c *Client) Healthy(ctx context.Context) bool {
	c.healthMu.Lock()
	defer c.healthMu.Unlock()

	if time.Since(c.healthChecked) < 30*time.Second {
		return c.healthy
	}

	_, err := c.do(ctx, http.MethodGet, c.rootURL, "openapi.json", nil)
	c.healthy = err == nil
	c.healthChecked = time.Now()
	if err != nil {
		slog.Warn("healthcheck failed", "err", err)
	}
	return c.healthy
}
