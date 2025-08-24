import { Requests } from "@requests/main";
import { TTLCache } from "./ttlCache";
import { getLogger } from "@logging/context";
import type { DetailedGuild } from "@typings/requests";

const GuildCache = new TTLCache<DetailedGuild>();

export async function getGuild(guild_id: string) {
	await populateGuild(guild_id);
	return GuildCache.get(guild_id);
}

async function populateGuild(guild_id: string) {
	const logger = getLogger();

	if (GuildCache.has(guild_id)) {
		logger.debug("TimeCache hit");
		return;
	}

	const res = await Requests.getGuildTimes(guild_id);
	if (res.error) {
		logger.error({ err: res.error }, "Error fetching guild times");
		return;
	}

	if (!res.data.pbs) {
		logger.warn("No guild times found");
		return;
	}

	GuildCache.set(guild_id, res.data);
}

// Cache invalidation function for when time data changes
export function invalidateGuildCache(guild_id: string): void {
	const logger = getLogger();
	GuildCache.delete(guild_id);
	logger.debug(`Invalidated guild cache for guild ${guild_id}`);
}
