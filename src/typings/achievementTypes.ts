import type { GuildMember, Snowflake } from "discord.js";

export type AchievementCache = Map<Snowflake, AchievementRequestData>;

export type AchievementRequestData = {
  member: GuildMember;
  achievement: string;
  channel: string;
  message: string;
  timestamp: number;
};
