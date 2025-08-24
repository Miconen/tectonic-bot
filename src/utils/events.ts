import { getLogger } from "@logging/context";
import { Requests } from "@requests/main";
import type { GuildEvent } from "@typings/requests";
import { TTLCache } from "@utils/ttlCache";

export const GuildEvents = new TTLCache<GuildEvent[]>();

export async function getEvents(guild_id: string) {
	await populateEvents(guild_id);
	return GuildEvents.get(guild_id);
}

async function populateEvents(guild_id: string) {
	const logger = getLogger();

	if (GuildEvents.has(guild_id)) {
		logger.debug("TimeEvents cache hit");
		return;
	}

	const res = await Requests.getEvents(guild_id);
	if (res.error) {
		logger.error({ err: res.message }, "Error fetching guild events");
		return;
	}

	if (!res.data) {
		logger.warn("No guild events found");
	}

	GuildEvents.set(guild_id, res.data);
}
