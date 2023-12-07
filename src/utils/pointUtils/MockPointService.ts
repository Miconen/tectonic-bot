import IDatabase from "@database/IDatabase";
import IPointService from "@utils/pointUtils/IPointService";
import IRankService from "@utils/rankUtils/IRankService";
import { BaseInteraction, Collection, GuildMember } from "discord.js";
import { inject, injectable, singleton } from "tsyringe";

@singleton()
@injectable()
export class MockPointService implements IPointService {
    readonly pointRewards: Map<string, number>
    private pointMultiplierCache: Map<string, number>

    constructor(
        @inject("RankService") private rankService: IRankService,
        @inject("Database") private database: IDatabase
    ) {
        this.pointRewards = new Map([
            ["event_participation", 5],
            ["event_hosting", 10],
            ["forum_bump", 5],
            ["learner_half", 5],
            ["learner_full", 10],
            ["split_low", 10],
            ["split_medium", 20],
            ["split_high", 30],
        ])

        this.pointMultiplierCache = new Map()
    }

    async givePoints(addedPoints: number, users: GuildMember, interaction: BaseInteraction) {
        return "Points response"
    }
    async givePointsToMultiple(addedPoints: number, users: Collection<string, GuildMember>, interaction: BaseInteraction, extraPoints?: {[key: string]: number}) {
        return ["Points response"]
    }

    async pointsHandler(points: number, guild_id: string) {
        return 10;
    }
}
