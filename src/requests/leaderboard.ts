import type { User } from "@typings/api/user";
import { fetchData } from "./main";

export async function getLeaderboard(guild_id: string) {
  return await fetchData<User[]>(`guilds/${guild_id}/leaderboard`);
}
