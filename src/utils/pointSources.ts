import { Requests } from "@requests/main";
import type { GuildPointSource } from "@typings/requests";
import { TTLCache } from "@utils/ttlCache";

export const PointSources = new TTLCache<Map<string, GuildPointSource>>(null);
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

	await populateSources(guild_id);

	const points = PointSources.get(guild_id)?.get(source)?.points ?? 0;
	const multi = Multipliers.get(guild_id) ?? 1;

	return points * multi;
}

export async function getSources(guild_id: string) {
	await populateSources(guild_id);
	return PointSources.get(guild_id);
}

async function populateSources(guild_id: string) {
	const guild = new Map<string, GuildPointSource>();
	if (!PointSources.has(guild_id)) {
		const res = await Requests.getGuildPointSources(guild_id);
		if (res.error) return guild;

		for (const ps of res.data) {
			guild.set(ps.source, ps);
		}
		PointSources.set(guild_id, guild);
	}
}
