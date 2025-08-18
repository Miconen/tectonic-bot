import { Requests } from "@requests/main";
import { TTLCache } from "@utils/ttlCache";

export const PointSources = new TTLCache<number>(null);
export const Multipliers = new TTLCache<number>(null);

export async function getPoints(source: string | number, guild_id: string) {
	if (!Multipliers.has(guild_id)) {
		const res = await Requests.getGuild(guild_id);
		if (res.error) return 0;

		Multipliers.set(guild_id, res.data.multiplier);
	}

	// Discriminate number out of the source type leaving it as a string
	if (typeof source === "number") {
		return source * (Multipliers.get(guild_id) ?? 1);
	}

	if (!PointSources.has(`${guild_id}-${source}`)) {
		const res = await Requests.getGuildPointSources(guild_id);
		if (res.error) return 0;

		for (const ps of res.data) {
			PointSources.set(`${guild_id}-${ps.source}`, ps.points);
		}
	}

	const points = PointSources.get(`${guild_id}-${source}`) ?? 0;
	const multi = Multipliers.get(guild_id) ?? 1;

	return points * multi;
}
