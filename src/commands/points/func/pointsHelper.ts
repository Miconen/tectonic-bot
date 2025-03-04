import type { CommandInteraction, GuildMember } from "discord.js"
import type IRankService from "../../../utils/rankUtils/IRankService"

import { container } from "tsyringe"

const pointsHelper = async (
    user: GuildMember | null,
    interaction: CommandInteraction
) => {
    const rankService = container.resolve<IRankService>("RankService")

    let targetUser = user?.user?.id ?? interaction.user.id ?? "0"
    let targetUserName =
        user?.displayName ??
        (interaction.member as GuildMember).displayName ??
        "???"

    let points = Requests.getUserPoints(interaction.guildId!, { type: "user_id", user_id: targetUser })

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
