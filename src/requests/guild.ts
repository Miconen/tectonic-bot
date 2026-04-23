import type { Guild, GuildUpdate } from "@typings/api/guild";
import { fetchData } from "./main";

export async function getGuild(guild_id: string) {
  return await fetchData<Guild>(`guilds/${guild_id}`);
}

export async function createGuild(guild_id: string) {
  return await fetchData("guilds", {
    method: "POST",
    body: JSON.stringify({ guild_id }),
  });
}

export async function updateGuild(guild_id: string, query: GuildUpdate) {
  return await fetchData(`guilds/${guild_id}`, {
    method: "PUT",
    body: JSON.stringify(query),
  });
}

export async function removeGuild(guild_id: string) {
  return await fetchData(`guilds/${guild_id}`, { method: "DELETE" });
}
