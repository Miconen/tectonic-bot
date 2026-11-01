package str

import (
	"fmt"

	"github.com/Miconen/tectonic-bot/internal/tectonic"
)

// Overrides maps API error codes to context-specific messages. A handler
// attaches one to an error with reply.WithOverrides; codes it doesn't cover
// fall back to APIErrors, then to the API's own message.
type Overrides map[tectonic.Code]string

// APIErrors is the standard fallback for every command (apiErrors in TS).
var APIErrors = Overrides{
	tectonic.CodeWrongParams:      "The request parameters were invalid.",
	tectonic.CodeWrongBody:        "The request body was invalid.",
	tectonic.CodeValidationFailed: "The request failed validation.",
	tectonic.CodeInvalidToken:     "The bot could not authenticate with the API.",
	tectonic.CodeAPIRateLimited:   "The API is receiving too many requests. Please try again shortly.",
	tectonic.CodeAPIUnavailable:   "The API is currently unavailable. Please try again later.",
	tectonic.CodeAPIDead:          "The API encountered an unexpected error. Please try again later.",
	tectonic.CodeWomUnavailable:   "Wise Old Man is currently unavailable. Please try again later.",
	tectonic.CodeWomRateLimited:   "Wise Old Man is receiving too many requests. Please try again later.",
	tectonic.CodeUntreated:        "An unexpected API error occurred. Please try again later.",
}

// AccountArgs holds whatever the call site knows. Templates whose arguments
// are empty are left out, the same as getString's fallthrough in TS.
type AccountArgs struct {
	Username string
	RSN      string
	WomID    string
}

// AccountErrors is accountErrors in TS.
func AccountErrors(a AccountArgs) Overrides {
	o := Overrides{}
	if a.Username != "" {
		o[tectonic.CodeUserNotFound] = fmt.Sprintf("User **%s** is not activated in this server.", a.Username)
		o[tectonic.CodeUserExists] = fmt.Sprintf("User **%s** is already activated in this server.", a.Username)
	}
	if a.RSN != "" {
		if a.Username != "" {
			o[tectonic.CodeRSNNotFound] = fmt.Sprintf("RSN **%s** is not linked to **%s**.", a.RSN, a.Username)
		}
		o[tectonic.CodeRSNExists] = fmt.Sprintf("RSN **%s** is already linked to a user.", a.RSN)
		o[tectonic.CodeWomUserNotFound] = fmt.Sprintf("Player **%s** was not found or is not tracked on Wise Old Man.", a.RSN)
	}
	if a.WomID != "" {
		o[tectonic.CodeWomIDNotFound] = fmt.Sprintf("WOM ID **%s** is not linked to a user.", a.WomID)
		o[tectonic.CodeWomIDExists] = fmt.Sprintf("WOM ID **%s** is already linked to a user.", a.WomID)
	}
	return o
}

type GuildArgs struct {
	Boss        string
	Category    string
	PointSource string
}

// GuildErrors is guildErrors in TS.
func GuildErrors(a GuildArgs) Overrides {
	o := Overrides{
		tectonic.CodeGuildNotFound: "This server has not been initialized.",
		tectonic.CodeGuildExists:   "This server has already been initialized.",
	}
	if a.Boss != "" {
		o[tectonic.CodeGuildBossNotFound] = fmt.Sprintf("Boss **%s** is not configured for this server.", a.Boss)
		o[tectonic.CodeGuildBossExists] = fmt.Sprintf("Boss **%s** is already configured for this server.", a.Boss)
	}
	if a.Category != "" {
		o[tectonic.CodeGuildCategoryNotFound] = fmt.Sprintf("Category **%s** is not configured for this server.", a.Category)
		o[tectonic.CodeGuildCategoryExists] = fmt.Sprintf("Category **%s** is already configured for this server.", a.Category)
	}
	if a.PointSource != "" {
		o[tectonic.CodePointSourceNotFound] = fmt.Sprintf("Point source **%s** was not found.", a.PointSource)
		o[tectonic.CodePointSourceExists] = fmt.Sprintf("Point source **%s** already exists.", a.PointSource)
	}
	return o
}

// RecordErrors is recordErrors in TS (only the argument-free entries are
// needed by /profile).
func RecordErrors() Overrides {
	return Overrides{
		tectonic.CodeRecordExists: "That record already exists.",
		tectonic.CodeUserNotFound: "One or more team members are not activated in this server.",
	}
}
