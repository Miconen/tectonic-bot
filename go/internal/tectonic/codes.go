package tectonic

// Code is a Tectonic API error code (APIV1ErrorCode in tectonic-api).
type Code int

// CodeUnknown is used for errors that carry no API code (RFC 7807 validation
// errors, network failures, unparseable bodies).
const CodeUnknown Code = -1

// Request-based errors
const (
	CodeWrongParams Code = iota
	CodeWrongBody
	CodeValidationFailed
	CodeInvalidToken
	CodeInsufficientScope
	CodeAPIRateLimited
)

// Model-based errors
const (
	CodeGuildNotFound Code = 1000 + iota
	CodeGuildExists
	CodeBossNotFound
	CodeBossExists
	CodeCategoryNotFound
	CodeCategoryExists
	CodeRSNNotFound
	CodeRSNExists
	CodeTimeNotFound
	CodeTimeExists
	CodeRecordNotFound
	CodeRecordExists
	CodeUserNotFound
	CodeUserExists
	CodeWomIDNotFound
	CodeWomIDExists
	CodeParticipationNotFound
	CodeParticipationExists
	CodeGuildBossNotFound
	CodeGuildBossExists
	CodeGuildCategoryNotFound
	CodeGuildCategoryExists
	CodeTeamNotFound
	CodeTeamExists
	CodeEventNotFound
	CodeEventExists
	CodeAchievementNotFound
	CodeAchievementExists
	CodeUserAchievementNotFound
	CodeUserAchievementExists
	CodePointSourceNotFound
	CodePointSourceExists
	CodeCombatAchievementNotFound
	CodeCombatAchievementExists
	CodeGuildRankNotFound
	CodeGuildRankExists
	CodeWomUserNotFound
	CodeWomCompetitionNotFound
)

// Server-side errors
const (
	CodeAPIUnavailable Code = 2000 + iota
	CodeAPIDead
	CodeWomUnavailable
	CodeWomRateLimited
)

const CodeUntreated Code = 10000

// Known reports whether c is a code the API defines. Unknown codes (including
// CodeUnknown) must not have their raw message shown to users.
func (c Code) Known() bool {
	switch {
	case c >= CodeWrongParams && c <= CodeAPIRateLimited,
		c >= CodeGuildNotFound && c <= CodeWomCompetitionNotFound,
		c >= CodeAPIUnavailable && c <= CodeWomRateLimited,
		c == CodeUntreated:
		return true
	}
	return false
}
