import { injectable, inject, singleton } from "tsyringe"
import IPointService from "./IPointService.js"
import { BaseInteraction, Collection, GuildMember } from "discord.js"
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

        let res = await Requests.getGuild(guild_id)
        if (res.error) return points
        let multi = res.data.multiplier
        if (!multi) return points
        if (isNaN(multi) || multi == 0) return points

        this.pointMultiplierCache.set(guild_id, multi)
        return points * multi
    }

    async givePointsToMultiple(
        addedPoints: number,
        users: Collection<string, GuildMember>,
        interaction: BaseInteraction,
        extraPoints?: { [key: string]: number }
    ) {
        let responses: Promise<string>[] = []

        // TODO: Transition to using new points endpoints instead of multiple queries
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
        if (!interaction.guild) return "Error fetching guild"
        const member = interaction.member as GuildMember

        const res = await Requests.givePoints(interaction.guild.id, { user_id: user.id, points: { type: "custom", amount: addedPoints } })

        if (res.error) {
            if (res.status === 404) {
                let response = `❌ **${user.displayName}** is not an activated user.`
                return response
            }

            return "Error giving points"
        }

        if (res.status === 200) {
            let newPoints = res.data.points
            console.log(res.data)

            let response = `✔ **${user.displayName}** was granted ${addedPoints} points by **${member.displayName}** and now has a total of ${newPoints} points.`
            let newRank = await this.rankService.rankUpHandler(
                interaction,
                user,
                newPoints - addedPoints,
                newPoints
            )

            if (!newRank) return response

            // Concatenate level up message to response if user leveled up
            let newRankIcon = this.rankService.getIcon(newRank)
            response += `\n**${user.displayName}** ranked up to ${newRankIcon} ${capitalizeFirstLetter(
                newRank
            )}!`

            return response

        }

        return "Error giving points"
    }
}
