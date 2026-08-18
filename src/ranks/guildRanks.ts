import { TTLCache } from "@utils/ttlCache";
import { getLogger } from "@logging/context";
import { Requests } from "@requests/main";
import type { GuildRankResponse } from "@typings/api/guildRank";

const GuildRanks = new TTLCache<GuildRankResponse[]>();

export async function getRanks(guild_id: string) {
	await populateRanks(guild_id);
	return GuildRanks.get(guild_id) ?? [];
}

async function populateRanks(guild_id: string) {
	const logger = getLogger();

	if (GuildRanks.has(guild_id)) {
		logger.debug("GuildRanks hit");
		return;
	}

	const res = await Requests.getGuildRanks(guild_id);
	if (res.error) {
		logger.error({ err: res.error }, "Error fetching guild ranks");
		return;
	}

	GuildRanks.set(guild_id, res.data);
}

// Cache invalidation function for when rank data changes
export function invalidateGuildRanks(guild_id: string): void {
	const logger = getLogger();
	GuildRanks.delete(guild_id);
	logger.debug(`Invalidated guild ranks for guild ${guild_id}`);
}
