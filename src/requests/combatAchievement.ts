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

export async function giveUserCombatAchievement(
  guild_id: string,
  user_id: string,
  ca_name: string
) {
  const url = `guilds/${guild_id}/users/${user_id}/combat-achievements/${encodeURIComponent(
    ca_name
  )}`;
  const options = { method: "POST" };
  return await fetchData(url, options);
}

export async function removeUserCombatAchievement(
  guild_id: string,
  user_id: string,
  ca_name: string
) {
  const url = `guilds/${guild_id}/users/${user_id}/combat-achievements/${encodeURIComponent(
    ca_name
  )}`;
  const options = { method: "DELETE" };
  return await fetchData(url, options);
}
