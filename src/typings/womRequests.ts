export type WomPlayer = {
	iD: number;
	username: string;
	displayName: string;
	type: string;
	build: string;
	country: string;
	status: string;
	patron: boolean;
	exp: number;
	ehp: number;
	ehb: number;
	ttm: number;
	tt200M: number;
	registeredAt: string;
	updatedAt: string;
	lastChangedAt: string;
	lastImportedAt: string;
};

export type WomProgress = {
	gained: number;
	start: number;
	end: number;
};

export type WomLevels = {
	gained: number;
	start: number;
	end: number;
};

export type WomParticipations = {
	playerID: number;
	competitionID: number;
	teamName: string;
	createdAt: string;
	updatedAt: string;
	player: WomPlayer;
	progress: WomProgress;
	levels: WomLevels;
	rank: number;
};

export type WomCompetition = {
	participations: WomParticipations[];
};
