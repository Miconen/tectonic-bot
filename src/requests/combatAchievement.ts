import type { CombatAchievementEntry } from "@typings/api/achievement";
import type { PointsResponse } from "@typings/api/points";
import { fetchData } from "./main";

export async function getGuildCombatAchievements(guild_id: string) {
  return await fetchData<CombatAchievementEntry[]>(
    `guilds/${guild_id}/combat-achievements`
  );
}

export async function completeCombatAchievement(
  guild_id: string,
  ca_name: string,
  user_ids: string[]
) {
  return await fetchData<PointsResponse[]>(
    `guilds/${guild_id}/combat-achievements/${encodeURIComponent(
      ca_name
    )}/complete`,
    { method: "POST", body: JSON.stringify({ user_ids }) }
  );
}

export async function giveUserCombatAchievement(
  guild_id: string,
  user_id: string,
  ca_name: string
) {
  return await fetchData(
    `guilds/${guild_id}/users/${user_id}/combat-achievements/${encodeURIComponent(
      ca_name
    )}`,
    { method: "POST" }
  );
}

export async function removeUserCombatAchievement(
  guild_id: string,
  user_id: string,
  ca_name: string
) {
  return await fetchData(
    `guilds/${guild_id}/users/${user_id}/combat-achievements/${encodeURIComponent(
      ca_name
    )}`,
    { method: "DELETE" }
  );
}
