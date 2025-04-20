import type { Achievement, AchievementParam } from "@typings/requests";
import { fetchData } from "./main";

function achievementParamHandler(query: AchievementParam) {
	if (query.type === "rsn") {
		return `rsn/${query.rsn}`;
	}
	return query.user_id;
}

export async function getAchievements() {
	const url = "achievements";
	const achievements = await fetchData<Achievement[]>(url);

	return achievements;
}

export async function giveAchievement(params: AchievementParam) {
	const url = `achievements/${params.achievement}/users/${achievementParamHandler(params)}`;

	const options = { method: "POST" };

	const res = await fetchData(url, options);

	return res;
}

export async function removeAchievement(params: AchievementParam) {
	const url = `achievements/${params.achievement}/users/${achievementParamHandler(params)}`;

	const options = { method: "DELETE" };

	const res = await fetchData(url, options);

	return res;
}

export async function checkHealth() {
	const url = "ping";
	const res = await fetchData(url);

	return res;
}
