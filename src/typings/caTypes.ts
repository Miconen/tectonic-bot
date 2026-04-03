import type { GuildMember, Snowflake } from "discord.js";

export type CaCache = Map<Snowflake, CaData>;

export type CaData = {
  caName: string;
  guildId: string;
  members: GuildMember[];
  userIds: string[];
  alreadyCompleted: string[];
  newCompleters: string[];
  channel: string;
  message: string;
  timestamp: number;
};
