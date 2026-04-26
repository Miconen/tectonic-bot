import type { GuildRankResponse } from "@typings/api/guildRank";
import { fetchData } from "./main";

export async function getGuildRanks(guild_id: string) {
  return await fetchData<GuildRankResponse[]>(`guilds/${guild_id}/ranks`);
}

export async function createGuildRank(
  guild_id: string,
  body: {
    name: string;
    min_points: number;
    icon?: string;
    role_id?: string;
    display_order: number;
  }
) {
  return await fetchData(`guilds/${guild_id}/ranks`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateGuildRank(
  guild_id: string,
  name: string,
  body: {
    min_points?: number;
    icon?: string;
    role_id?: string;
    display_order?: number;
  }
) {
  return await fetchData(
    `guilds/${guild_id}/ranks/${encodeURIComponent(name)}`,
    {
      method: "PUT",
      body: JSON.stringify(body),
    }
  );
}

export async function deleteGuildRank(guild_id: string, name: string) {
  return await fetchData(
    `guilds/${guild_id}/ranks/${encodeURIComponent(name)}`,
    { method: "DELETE" }
  );
}
