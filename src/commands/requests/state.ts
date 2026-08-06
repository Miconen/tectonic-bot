import type { PendingRequest, RequestCache } from "@typings/requestTypes.js";
import type { Snowflake } from "discord.js";

export const pendingRequests: RequestCache = new Map<
	Snowflake,
	PendingRequest
>();
