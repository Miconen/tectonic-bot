import type { PbCache, PbData } from "@typings/pbTypes.js";
import type { Snowflake } from "discord.js";

export const pbState: PbCache = new Map<Snowflake, PbData>();
