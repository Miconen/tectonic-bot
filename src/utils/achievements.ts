import { withInitLogging } from "@logging/context";
import { Requests } from "@requests/main";
import type { Achievement } from "@typings/requests";
import { TTLCache } from "@utils/ttlCache";

export const Achievements = new TTLCache<Achievement>(null);

const res = await withInitLogging(
	"Achievement initialization",
	Requests.getAchievements,
);

if (res.error) {
	throw new Error("Could not fetch achievement list from database");
}

for (const achievement of res.data) {
	Achievements.set(achievement.name, achievement);
}
