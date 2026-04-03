import type { CombatAchievementEntry, PointsResponse } from "@typings/requests";
import { fetchData } from "./main";

export async function getGuildCombatAchievements(guild_id: string) {
  const url = `guilds/${guild_id}/combat-achievements`;
  return await fetchData<CombatAchievementEntry[]>(url);
}

export async function completeCombatAchievement(
  guild_id: string,
  ca_name: string,
  user_ids: string[]
) {
  const url = `guilds/${guild_id}/combat-achievements/${encodeURIComponent(
    ca_name
  )}/complete`;
  const options = {
    method: "POST",
    body: JSON.stringify({ user_ids }),
  };
  return await fetchData<PointsResponse[]>(url, options);
}
