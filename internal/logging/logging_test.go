package logging

import (
	"bytes"
	"context"
	"encoding/json"
	"log/slog"
	"testing"
)

func TestLoggerCarriesContext(t *testing.T) {
	var buf bytes.Buffer
	old := slog.Default()
	slog.SetDefault(slog.New(slog.NewJSONHandler(&buf, nil)))
	t.Cleanup(func() { slog.SetDefault(old) })

	ctx := WithActor(WithID(context.Background(), "99"), "555")
	ctx = With(ctx, "command", "pb cox")
	Logger(ctx).Info("hello")

	var line map[string]any
	if err := json.Unmarshal(buf.Bytes(), &line); err != nil {
		t.Fatal(err)
	}
	for k, want := range map[string]string{"request_id": "99", "user_id": "555", "command": "pb cox"} {
		if line[k] != want {
			t.Errorf("%s = %v, want %s", k, line[k], want)
		}
	}
}
