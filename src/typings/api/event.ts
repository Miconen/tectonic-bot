import type { DetailedUser, RSN } from "./user";

export type EventDetails = {
	name: string;
	wom_id: string;
	guild_id: string;
	position_cutoff: number;
	solo: boolean;
};

export type EventParticipation = {
	user_id: string;
	placement: number;
};

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
	solo?: boolean;
};

export type CompetitionResponse = {
	title: string;
	participant_count: number;
	participants: DetailedUser[];
	accounts: RSN[];
	cutoff: number;
	points_given: number;
};
