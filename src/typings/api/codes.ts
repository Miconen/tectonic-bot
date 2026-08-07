export const ApiErrorCode = {
	WrongParams: 0,
	WrongBody: 1,
	ValidationFailed: 2,
	InvalidToken: 3,
	ApiRateLimited: 4,

	GuildNotFound: 1000,
	GuildExists: 1001,

	BossNotFound: 1002,
	BossExists: 1003,

	CategoryNotFound: 1004,
	CategoryExists: 1005,

	RsnNotFound: 1006,
	RsnExists: 1007,

	TimeNotFound: 1008,
	TimeExists: 1009,

	RecordNotFound: 1010,
	RecordExists: 1011,

	UserNotFound: 1012,
	UserExists: 1013,

	WomIdNotFound: 1014,
	WomIdExists: 1015,

	ParticipationNotFound: 1016,
	ParticipationExists: 1017,

	GuildBossNotFound: 1018,
	GuildBossExists: 1019,

	GuildCategoryNotFound: 1020,
	GuildCategoryExists: 1021,

	TeamNotFound: 1022,
	TeamExists: 1023,

	EventNotFound: 1024,
	EventExists: 1025,

	AchievementNotFound: 1026,
	AchievementExists: 1027,

	UserAchievementNotFound: 1028,
	UserAchievementExists: 1029,

	PointSourceNotFound: 1030,
	PointSourceExists: 1031,

	CombatAchievementNotFound: 1032,
	CombatAchievementExists: 1033,

	GuildRankNotFound: 1034,
	GuildRankExists: 1035,

	WomUserNotFound: 1036,
	WomCompetitionNotFound: 1037,

	ApiUnavailable: 2000,
	ApiDead: 2001,
	WomUnavailable: 2002,
	WomRateLimited: 2003,

	Untreated: 10000,
} as const;

export type ApiErrorCode = (typeof ApiErrorCode)[keyof typeof ApiErrorCode];
