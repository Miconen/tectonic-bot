import type { DetailedGuild } from "@typings/api/guild";
import type { NewTime, TimeResponse } from "@typings/api/time";
import { fetchData } from "./main";

export async function getGuildTimes(guild_id: string) {
  return await fetchData<DetailedGuild>(`guilds/${guild_id}/times`);
}

export async function newTime(guild_id: string, query: NewTime) {
  return await fetchData<TimeResponse>(`guilds/${guild_id}/times`, {
    method: "POST",
    body: JSON.stringify(query),
  });
}

export async function removeTimeById(guild_id: string, time_id: string) {
  return await fetchData(`guilds/${guild_id}/times/id/${time_id}`, {
    method: "DELETE",
  });
}

export async function revertGuildBossPb(guild_id: string, boss: string) {
  return await fetchData(`guilds/${guild_id}/times/${boss}/revert`, {
    method: "DELETE",
  });
}

export async function clearGuildBossPb(guild_id: string, boss: string) {
  return await fetchData(`guilds/${guild_id}/times/${boss}/clear`, {
    method: "DELETE",
  });
}
