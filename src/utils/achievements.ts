import { Requests } from "@requests/main";
import type { Achievement } from "@typings/requests";

export const Achievements: Achievement[] = [];

const res = await Requests.getAchievements();

if (res.error) {
	throw new Error("Could not fetch achievement list from database");
}

if (!res.data.length)
	console.log(
		"Database currently does not include any achievements, consider adding some...",
	);
