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
