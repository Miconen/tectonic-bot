import type { DetailedGuild } from "@typings/api/guild";
import type { NewRecord, RecordResponse } from "@typings/api/time";
import { fetchData } from "./main";

export async function getGuildTimes(guild_id: string) {
  return await fetchData<DetailedGuild>(`guilds/${guild_id}/records`);
}

export async function newTime(guild_id: string, query: NewRecord) {
  return await fetchData<RecordResponse>(`guilds/${guild_id}/records`, {
    method: "POST",
    body: JSON.stringify(query),
  });
}

export async function removeTimeById(guild_id: string, record_id: string) {
  return await fetchData(`guilds/${guild_id}/records/id/${record_id}`, {
    method: "DELETE",
  });
}
