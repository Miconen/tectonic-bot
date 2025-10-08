export type GenericError = {
	code: number;
	name: string;
	message: string;
};

export type ValidationError = {
	details: ValidationErrorBody[];
} & GenericError;

export type ValidationErrorBody = {
	field: string;
	value: unknown;
	tag: string;
	message: string;
};

export type ErrorResponse = {
	error: true;
	status: number;
} & (GenericError | ValidationError);

export type SuccessResponse<T> = {
	error: false;
	status: number;
	data: T;
};

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export type RSN = {
	rsn: string;
	wom_id: string;
};

export type GuildEvent = {
	name: string;
	wom_id: string;
	guild_id: string;
	postition_cutoff: number;
	user_id: string;
	placement: number;
};

export type SimpleUser = {
	user_id: string;
	guild_id: string;
	points: number;
};

export type PointsResponse = SimpleUser & {
	given_points: number;
};

export type User = SimpleUser & {
	rsns: RSN[];
	events: GuildEvent[];
	achievements: Achievement[];
};

export type DetailedTime = {
	time: number;
	boss_name: string;
	display_name: string;
	category: string;
	run_id: number;
	date: string;
	solo: boolean;
	team: User[];
};

export type NewTime = {
	user_ids: string[];
	time: number;
	boss_name: string;
};

export type TimeResponse = {
	boss_name: string;
	time: number;
	time_old: number;
	run_id: number;
};

export type DetailedUser = User & { times: DetailedTime[] };

export type Guild = {
	guild_id: string;
	multiplier: number;
	pb_channel_id: string | undefined;
};

export type UserById = {
	type: "user_id";
	user_id: string;
};

export type UserByWom = {
	type: "wom";
	wom: string;
};

export type UserByRsn = {
	type: "rsn";
	rsn: string;
};

export type UserParam = UserById | UserByWom | UserByRsn;

export type UsersById = {
	type: "user_id";
	user_id: string[];
};

export type UsersByWom = {
	type: "wom";
	wom: string[];
};

export type UsersByRsn = {
	type: "rsn";
	rsn: string[];
};

export type UsersParam = UsersById | UsersByWom | UsersByRsn;

export type CustomPoints = {
	type: "custom";
	amount: number;
};

export type PresetPoints = {
	type: "preset";
	event:
	| "event_participation"
	| "event_hosting"
	| "clan_pb"
	| "split_low"
	| "split_medium"
	| "split_high"
	| "combat_achievement_low"
	| "combat_achievement_medium"
	| "combat_achievement_high"
	| "combat_achievement_very_high"
	| "combat_achievement_very_highest";
};

export type Points = CustomPoints | PresetPoints;

export type PointsParam = {
	user_id: string | string[];
	points: Points;
};

export type CategoryUpdate = {
	message_id: string;
	category: string;
};

export type GuildUpdate = {
	pb_channel?: string;
	multiplier?: number;
	category_messages?: CategoryUpdate[];
};

export type CompetitionResponse = {
	title: string;
	participant_count: number;
	participants: DetailedUser[] | undefined;
	accounts: string[] | undefined;
	cutoff: number;
	points_given: number;
};

export type Boss = {
	name: string;
	display_name: string;
	category: string;
	solo: boolean;
};

export type Category = {
	thumbnail: string;
	order: number;
	name: string;
};

export type GuildBoss = {
	boss: string;
	guild_id: string;
	pb_id: number | undefined;
};

export type GuildCategory = {
	guild_id: string;
	category: string;
	message_id: string | undefined;
};

export type Time = {
	time: number;
	boss_name: string;
	run_id: number;
	date: string;
	guild_id: string;
};

export type Team = {
	run_id: number;
	user_id: string;
	guild_id: string;
};

export type GuildPointSource = {
	source: string;
	points: number;
	name: string;
};

export type DetailedGuild = {
	guild_id: string;
	pb_channel_id: string | undefined;
	bosses: Boss[];
	categories: Category[];
	guild_bosses: GuildBoss[];
	guild_categories: GuildCategory[];
	pbs: Time[] | undefined;
	teammates: Team[] | undefined;
};

export type Achievement = {
	name: string;
	thumbnail: string;
	discord_icon: string;
	order: number;
};

export type AchievementParam = { achievement: string; guild_id: string } & (
	| UserById
	| UserByRsn
);

export type EventIndividualWinParam = {
	type: "individual";
	top: number;
};

export type EventTeamWinParam = {
	type: "team";
	team_names: string[];
};

export type EventWinParam = {
	competition: number;
} & (EventIndividualWinParam | EventTeamWinParam);

export type EventUpdateParam = {
	name?: string;
	position_cutoff?: number;
}

export type TeamByRunId = {
	type: "run_id";
	run_id: number;
};

export type TeamByBoss = {
	type: "boss";
	boss: string;
};

export type TeamParam = TeamByRunId | TeamByBoss;
