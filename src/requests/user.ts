import type {
	DetailedUser,
	PointsParam,
	PointsResponse,
	UserParam,
	UsersParam,
} from "@typings/requests";
import { fetchData } from "./main";
import { rewrapResponse } from "./utils";

// Allows for creation of multiple convinience functions that return more specific data
function userParamHandler(query: UserParam | UsersParam) {
	const handleArray = (param: string | string[]) =>
		Array.isArray(param) ? param.join(",") : param;

	if (query.type === "wom") {
		return `wom/${handleArray(query.wom)}`;
	}
	if (query.type === "rsn") {
		return `rsn/${handleArray(query.rsn)}`;
	}
	return handleArray(query.user_id);
}

export async function getUser(guild_id: string, query: UserParam) {
	const url = `guilds/${guild_id}/users/${userParamHandler(query)}`;
	const user = await fetchData<DetailedUser[]>(url);
	if (user.error) return user;

	return rewrapResponse<DetailedUser | undefined, DetailedUser[]>(
		user,
		user.data.at(0),
	);
}

export async function getUsers(guild_id: string, query: UsersParam) {
	const url = `guilds/${guild_id}/users/${userParamHandler(query)}`;
	const users = await fetchData<DetailedUser[]>(url);

	return users;
}

export async function createUser(
	guild_id: string,
	user_id: string,
	rsn: string,
) {
	const url = `guilds/${guild_id}/users`;
	const options = { method: "POST", body: JSON.stringify({ user_id, rsn }) };
	const status = await fetchData(url, options);

	return status;
}

export async function removeUser(guild_id: string, query: UserParam) {
	const url = `guilds/${guild_id}/users/${userParamHandler(query)}`;
	const options = { method: "DELETE" };
	const status = await fetchData(url, options);

	return status;
}

export async function addRsn(guild_id: string, user_id: string, rsn: string) {
	const url = `guilds/${guild_id}/users/${user_id}/rsns`;
	const options = { method: "POST", body: JSON.stringify({ rsn }) };
	const status = await fetchData(url, options);

	return status;
}

export async function removeRsn(
	guild_id: string,
	user_id: string,
	rsn: string,
) {
	const url = `guilds/${guild_id}/users/${user_id}/rsns/${rsn}`;
	const options = { method: "DELETE" };
	const status = await fetchData(url, options);

	return status;
}

export async function givePointsToMultiple(
	guild_id: string,
	query: PointsParam,
) {
	const ids = Array.isArray(query.user_id) ? query.user_id : [query.user_id];
	let url = `guilds/${guild_id}/users/${ids.join(",")}/points/`;

	if (query.points.type === "custom") {
		url += `custom/${query.points.amount}`;
	} else {
		url += query.points.event;
	}

	const options = { method: "PUT" };
	const status = await fetchData<PointsResponse[]>(url, options);

	return status;
}

export async function givePoints(guild_id: string, query: PointsParam) {
	const res = await givePointsToMultiple(guild_id, query);

	if (res.error) return res;

	return rewrapResponse<PointsResponse | undefined, PointsResponse[]>(
		res,
		res.data.at(0),
	);
}
