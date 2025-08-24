import type { TeamParam } from "@typings/requests";
import { fetchData } from "./main";

// Allows for creation of multiple convinience functions that return more specific data
function teamParamHandler(query: TeamParam) {
	if (query.type === "run_id") {
		return `id/${query.run_id}`;
	}
	if (query.type === "boss") {
		return `boss/${query.boss}`;
	}
}

export async function addToTeam(
	guild_id: string,
	user_id: string,
	params: TeamParam,
) {
	const url = `guilds/${guild_id}/teams/${teamParamHandler(params)}`;
	const options = {
		method: "POST",
		body: JSON.stringify({ guild_id, user_id }),
	};
	const status = await fetchData<never>(url, options);

	return status;
}

export async function removeFromTeam(
	guild_id: string,
	user_id: string,
	params: TeamParam,
) {
	const url = `guilds/${guild_id}/teams/${teamParamHandler(params)}`;
	const options = {
		method: "DELETE",
		body: JSON.stringify({ guild_id, user_id }),
	};
	const status = await fetchData<never>(url, options);

	return status;
}
