import type { GuildPointSource } from "@typings/api/points";
import { fetchData } from "./main";

export async function getGuildPointSources(guild_id: string) {
  return await fetchData<GuildPointSource[]>(`guilds/${guild_id}/points`);
}
