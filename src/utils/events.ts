import { getLogger } from "@logging/context";
import { Requests } from "@requests/main";
import type { EventDetails, EventUpdateParam } from "@typings/requests";
import { TTLCache } from "@utils/ttlCache";

export const GuildEvents = new TTLCache<EventDetails[]>();

export async function getEvents(guild_id: string) {
	await populateEvents(guild_id);
	return GuildEvents.get(guild_id);
}

// Cache invalidation function for when event data changes
export function invalidateEventCache(guild_id: string): void {
	const logger = getLogger();
	GuildEvents.delete(guild_id);
	logger.debug(`Invalidated event cache for guild ${guild_id}`);
}

export async function updateEventCache(guild_id: string, event: string, params: EventUpdateParam) {
	const logger = getLogger();

	if (!params.name && !params.position_cutoff && !params.solo) {
		logger.error("Invalid event update params");
		return;
	}

	const ev = await getEvent(guild_id, event)
	if (!ev) {
		logger.error("Error fetching guild events");
		return;
	}

	if (params.position_cutoff) {
		ev.position_cutoff = params.position_cutoff
	}

	if (params.name) {
		ev.name = params.name
	}

	if (params.solo) {
		ev.solo = params.solo
	}

	logger.debug(`Updated event ${event} for guild ${guild_id}`);
}

export async function getEvent(guild_id: string, event: string) {
	const logger = getLogger();

	const events = await getEvents(guild_id);
	if (!events) {
		logger.error("Error fetching guild events");
		return;
	}

	return events.find(e => e.wom_id === event);
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
