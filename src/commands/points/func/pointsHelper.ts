import type { CommandInteraction, GuildMember } from "discord.js"
import type IRankService from "../../../utils/rankUtils/IRankService"
import type IDatabase from "../../../database/IDatabase"

import { container } from "tsyringe"

const pointsHelper = async (
    user: GuildMember | null,
    interaction: CommandInteraction
) => {
    const rankService = container.resolve<IRankService>("RankService")
    const database = container.resolve<IDatabase>("Database")

    let targetUser = user?.user?.id ?? interaction.user.id ?? "0"
    let targetUserName =
        user?.displayName ??
        (interaction.member as GuildMember).displayName ??
        "???"
    let points = await database.getPoints(interaction.guildId!, targetUser)

    let response: string
    if (points || points === 0) {
        let nextRankUntil = rankService.pointsToNextRank(points)
        let nextRankIcon = rankService.getIcon(
            rankService.getRankByPoints(points + nextRankUntil)
        )

        response = `${rankService.getIcon(
            rankService.getRankByPoints(points)
        )} **${targetUserName}** has: ${points} points`
        if (rankService.getRankByPoints(points) != "zenyte")
            response += `\n${nextRankIcon} Points to next level: ${nextRankUntil}`
    } else {
        response = `❌ ${targetUserName} is not activated.`
    }

    await interaction.reply(response)
}

export default pointsHelper
