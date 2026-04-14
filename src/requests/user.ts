import type { DetailedUser, UserParam, UsersParam } from "@typings/api/user";
import type { PointsParam, PointsResponse } from "@typings/api/points";
import { fetchData } from "./main";
import { rewrapResponse } from "./utils";

function userParamHandler(query: UserParam | UsersParam) {
  const handleArray = (param: string | string[]) =>
    Array.isArray(param) ? param.join(",") : param;

  if (query.type === "wom") return `wom/${handleArray(query.wom)}`;
  if (query.type === "rsn") return `rsn/${handleArray(query.rsn)}`;
  return handleArray(query.user_id);
}

export async function getUser(guild_id: string, query: UserParam) {
  const user = await fetchData<DetailedUser[]>(
    `guilds/${guild_id}/users/${userParamHandler(query)}`
  );
  if (user.error) return user;

  return rewrapResponse<DetailedUser | undefined, DetailedUser[]>(
    user,
    user.data.at(0)
  );
}

export async function getUsers(guild_id: string, query: UsersParam) {
  return await fetchData<DetailedUser[]>(
    `guilds/${guild_id}/users/${userParamHandler(query)}`
  );
}

export async function createUser(
  guild_id: string,
  user_id: string,
  rsn: string
) {
  return await fetchData(`guilds/${guild_id}/users`, {
    method: "POST",
    body: JSON.stringify({ user_id, rsn }),
  });
}

export async function removeUser(guild_id: string, query: UserParam) {
  return await fetchData(
    `guilds/${guild_id}/users/${userParamHandler(query)}`,
    { method: "DELETE" }
  );
}

export async function addRsn(guild_id: string, user_id: string, rsn: string) {
  return await fetchData(`guilds/${guild_id}/users/${user_id}/rsns`, {
    method: "POST",
    body: JSON.stringify({ rsn }),
  });
}

export async function removeRsn(
  guild_id: string,
  user_id: string,
  rsn: string
) {
  return await fetchData(`guilds/${guild_id}/users/${user_id}/rsns/${rsn}`, {
    method: "DELETE",
  });
}

export async function givePointsToMultiple(
  guild_id: string,
  query: PointsParam
) {
  const ids = Array.isArray(query.user_id) ? query.user_id : [query.user_id];
  let url = `guilds/${guild_id}/users/${ids.join(",")}/points/`;

  if (query.points.type === "custom") {
    url += `custom/${query.points.amount}`;
  } else {
    url += query.points.event;
  }

  return await fetchData<PointsResponse[]>(url, { method: "PUT" });
}

export async function givePoints(guild_id: string, query: PointsParam) {
  const res = await givePointsToMultiple(guild_id, query);
  if (res.error) return res;

  return rewrapResponse<PointsResponse | undefined, PointsResponse[]>(
    res,
    res.data.at(0)
  );
}
