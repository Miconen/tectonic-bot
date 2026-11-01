package tectonic

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"
)

// ErrNotFound matches any API error returned with HTTP 404.
var ErrNotFound = errors.New("not found")

// APIError is returned for any non-2xx response, and for transport or decoding
// failures (with Status 0 or the response status and CodeUnknown).
type APIError struct {
	Status  int
	Code    Code
	Message string
}

func (e *APIError) Error() string {
	return fmt.Sprintf("tectonic api: status %d, code %d: %s", e.Status, e.Code, e.Message)
}

func (e *APIError) Is(target error) bool {
	return target == ErrNotFound && e.Status == http.StatusNotFound
}

// decodeError turns an error body into an *APIError. The API sends either its
// own {code, message} shape or an RFC 7807 problem (Huma validation errors).
func decodeError(status int, body []byte) *APIError {
	var raw struct {
		// TectonicError
		Code    *int   `json:"code"`
		Message string `json:"message"`
		// RFC 7807
		Title  string `json:"title"`
		Detail string `json:"detail"`
		Errors []struct {
			Message string `json:"message"`
		} `json:"errors"`
	}
	if err := json.Unmarshal(body, &raw); err != nil {
		return &APIError{Status: status, Code: CodeUnknown, Message: "Failed to parse JSON response"}
	}

	if raw.Title != "" {
		msg := raw.Detail
		if len(raw.Errors) > 0 {
			parts := make([]string, len(raw.Errors))
			for i, e := range raw.Errors {
				parts[i] = e.Message
			}
			msg = strings.Join(parts, ", ")
		}
		return &APIError{Status: status, Code: CodeUnknown, Message: msg}
	}

	code := CodeUnknown
	if raw.Code != nil {
		code = Code(*raw.Code)
	}
	return &APIError{Status: status, Code: code, Message: raw.Message}
}
