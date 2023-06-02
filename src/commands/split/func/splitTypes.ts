import { GuildMember, Snowflake } from "discord.js";

export type SplitCache = Map<Snowflake, SplitData>;

export type SplitData = {
    member: GuildMember, 
    points: number,
}
