import type { GuildMember, Snowflake } from "discord.js";

export type PbCache = Map<Snowflake, PbData>;

export type PbData = {
  boss: string;
  time: string;
  team: string[];
  channel: string;
  message: string;
  timestamp: number;
};
