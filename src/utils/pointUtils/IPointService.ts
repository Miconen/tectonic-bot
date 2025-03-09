import { BaseInteraction, Collection, GuildMember } from "discord.js";

interface IPointService {
    pointRewards: Map<string, number>
    givePoints: (addedPoints: number, users: GuildMember, interaction: BaseInteraction) => Promise<string>
    givePointsToMultiple: (addedPoints: number, users: Collection<string, GuildMember>, interaction: BaseInteraction, extraPoints?: { [key: string]: number },
    ) => Promise<string[]>
    pointsHandler: (points: number, guild_id: string) => Promise<number>
}

export default IPointService;
