import type { RequestCache, PendingRequest } from "@typings/requestTypes.js";
import type { Snowflake } from "discord.js";

export const pendingRequests: RequestCache = new Map<
  Snowflake,
  PendingRequest
>();
