import { injectable, inject, singleton } from "tsyringe"
import IPointService from "./IPointService.js"
import { BaseInteraction, Collection, Guild, GuildMember } from "discord.js"
import capitalizeFirstLetter from "../capitalizeFirstLetter.js"
import IRankService from "../rankUtils/IRankService.js"
import { Requests } from "@requests/main.js"

@singleton()
@injectable()
export class PointService implements IPointService {
    readonly pointRewards: Map<string, number>
    private pointMultiplierCache: Map<string, number>

    constructor(
        @inject("RankService") private rankService: IRankService,
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

    async pointsHandler(points: number = 0, guild_id: string) {
        // Check if the multiplier is already cached
        if (this.pointMultiplierCache.has(guild_id)) {
            let cachedMultiplier = this.pointMultiplierCache.get(guild_id)
            if (!cachedMultiplier) return points
            return points * cachedMultiplier
        }

        let res = Requests.getGuild(guild_id).multiplier
        if (!res) return points
        if (isNaN(res) || res == 0) return points

        this.pointMultiplierCache.set(guild_id, res)
        return points * res
    }

    async givePointsToMultiple(
        addedPoints: number,
        users: Collection<string, GuildMember>,
        interaction: BaseInteraction,
        extraPoints?: { [key: string]: number }
    ) {
        let responses: Promise<string>[] = []

        users.forEach((user) => {
            let pointsToGive = addedPoints + (extraPoints?.[user.id] || 0)
            let points = this.givePoints(pointsToGive, user, interaction)
            responses.push(points)
        })

        return Promise.all(responses)
    }

    async givePoints(
        addedPoints: number,
        user: GuildMember,
        interaction: BaseInteraction
    ) {
        if (!this.rankService)
            return "Unexpected error happened with rank service"
        const { displayName: receivingUser = "???", id: receivingUserId } = user
        const { displayName: grantingUser = "???" } =
            interaction.member as GuildMember
        const { id: guildId } = interaction.guild as Guild

        let newPoints = Requests.givePoints(guildId, { type: "user_id", user_id: receivingUserId, points: addedPoints })

        let response: string
        // Check for 0 since it evaluates to false otherwise
        if (newPoints || newPoints === 0) {
            response = `✔ **${receivingUser}** was granted ${addedPoints} points by **${grantingUser}** and now has a total of ${newPoints} points.`
            let newRank = await this.rankService.rankUpHandler(
                interaction,
                user,
                newPoints - addedPoints,
                newPoints
            )
            // Concatenate level up message to response if user leveled up
            if (newRank) {
                let newRankIcon = this.rankService.getIcon(newRank)
                response += `\n**${receivingUser}** ranked up to ${newRankIcon} ${capitalizeFirstLetter(
                    newRank
                )}!`
            }
        }
        //else if (newPoints === false) {
        //    response = `❌ **${receivingUser}** is not an activated user.`
        //}
        else {
            response = "Error giving points"
        }

        return response
    }
}
