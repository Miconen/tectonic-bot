import { WomParticipations } from "@typings/womRequests";
import type {
	Boss,
	CompetitionResponse,
	EventTeamWinParam,
	EventWinParam,
	Guild,
	GuildTimes,
	GuildUpdate,
	NewTime,
	TimeResponse,
	User,
} from "typings/requests";
import { fetchData } from "./main";

export async function getLeaderboard(guild_id: string) {
	const url = `guilds/${guild_id}/leaderboard`;
	const leaderboard = await fetchData<User[]>(url);

	return leaderboard;
}

export async function getGuild(guild_id: string) {
	const url = `guilds/${guild_id}`;
	const guild = await fetchData<Guild>(url);

	return guild;
}

export async function createGuild(guild_id: string) {
	const url = "guilds";
	const options = {
		method: "POST",
		body: JSON.stringify({ guild_id }),
	};
	const status = await fetchData(url, options);

	return status;
}

export async function updateGuild(guild_id: string, query: GuildUpdate) {
	const url = `guilds/${guild_id}`;
	const options = {
		method: "PUT",
		body: JSON.stringify({
			multiplier: query.multiplier,
			pb_channel_id: query.pb_channel,
			category_messages: query.category_messages,
		}),
	};
	const status = await fetchData(url, options);

	return status;
}

export async function newTime(guild_id: string, query: NewTime) {
	const url = `guilds/${guild_id}/times`;
	const { user_ids, time, boss_name } = query;
	const options = {
		method: "POST",
		body: JSON.stringify({ guild_id, user_ids, time, boss_name }),
	};
	const status = await fetchData<TimeResponse>(url, options);

	return status;
}

export async function getBosses() {
	const url = "bosses";
	const status = await fetchData<Boss[]>(url);

	return status;
}

export async function eventCompetition(
	guild_id: string,
	competition_id: number,
	cutoff: number,
) {
	const url = `guilds/${guild_id}/wom/competition/${competition_id}/cutoff/${cutoff}`;
	const status = await fetchData<CompetitionResponse>(url);

	return status;
}

export async function getGuildTimes(guild_id: string) {
	const url = `guilds/${guild_id}/times`;
	const status = await fetchData<GuildTimes>(url);

	return status;
}

export async function eventWinners(guild_id: string, params: EventWinParam) {
	const endpoint = `guilds/${guild_id}/wom/winners/${params.competition}`;

	if (params.type === "individual") {
		endpoint.concat(`?top=${params.top}`);
	} else {
		endpoint.concat(`/team/${params.team}`);
	}

	return await fetchData<WomParticipations[]>(endpoint);
}
