import type { Achievement, AchievementParam } from "@typings/api/achievement";
import { fetchData } from "./main";

function achievementParamHandler(query: AchievementParam) {
  if (query.type === "rsn") return `rsn/${query.rsn}`;
  return query.user_id;
}

export async function getAchievements() {
  return await fetchData<Achievement[]>("achievements");
}

export async function giveAchievement(params: AchievementParam) {
  return await fetchData(
    `guilds/${params.guild_id}/users/${achievementParamHandler(
      params
    )}/achievements/${params.achievement}`,
    { method: "POST" }
  );
}

export async function removeAchievement(params: AchievementParam) {
  return await fetchData(
    `guilds/${params.guild_id}/users/${achievementParamHandler(
      params
    )}/achievements/${params.achievement}`,
    { method: "DELETE" }
  );
}
