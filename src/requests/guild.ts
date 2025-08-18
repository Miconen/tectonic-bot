import type { WomParticipations } from "@typings/womRequests";
import type {
	Boss,
	CompetitionResponse,
	EventWinParam,
	Guild,
	GuildPointSource,
	GuildTimes,
	GuildUpdate,
	NewTime,
	TimeResponse,
	User,
} from "@typings/requests";
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

export async function removeGuild(guild_id: string) {
	const url = `guilds/${guild_id}`;
	const options = { method: "DELETE" };

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
		body: JSON.stringify({ user_ids, time, boss_name }),
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
	const endpoint = `guilds/${guild_id}/events`;

	const body =
		params.type === "individual"
			? { position_cutoff: params.top, event_id: params.competition }
			: { team_names: params.team_names, event_id: params.competition };

	const options = {
		method: "POST",
		body: JSON.stringify(body),
	};

	return await fetchData<WomParticipations[]>(endpoint, options);
}

export async function getEvents(guild_id: string) {
	const endpoint = `guilds/${guild_id}/events`;

	return await fetchData<Event[]>(endpoint);
}

export async function getGuildPointSources(guild_id: string) {
	const url = `guilds/${guild_id}/points`;
	const status = await fetchData<GuildPointSource[]>(url);

	return status;
}
