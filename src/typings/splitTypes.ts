import type { GuildMember, Snowflake } from "discord.js";

export type SplitCache = Map<Snowflake, SplitData>;

export type SplitData = {
    member: GuildMember,
    channel: string,
    message: string,
    points: number,
    timestamp: number,
}
