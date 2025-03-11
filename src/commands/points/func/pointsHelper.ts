import type { CommandInteraction, GuildMember } from "discord.js"
import type IRankService from "../../../utils/rankUtils/IRankService"
import { Requests } from "@requests/main.js"

import { container } from "tsyringe"
import { getString } from "@utils/stringRepo"

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

    let res = await Requests.getUser(interaction.guildId!, { type: "user_id", user_id: targetUser })
    if (res.error) {
        const response = `❌ ${targetUserName} is not activated.`
        return await interaction.reply(response)
    }

    if (!res.data) {
        return getString("accounts", "notActivated", { username: targetUserName })
    }

    const points = res.data.points

    let nextRankUntil = rankService.pointsToNextRank(points)
    let nextRankIcon = rankService.getIcon(
        rankService.getRankByPoints(points + nextRankUntil)
    )

    let response = `${rankService.getIcon(
        rankService.getRankByPoints(points)
    )} **${targetUserName}** has: ${points} points`
    if (rankService.getRankByPoints(points) != "zenyte")
        response += `\n${nextRankIcon} Points to next level: ${nextRankUntil}`

    return await interaction.reply(response)
}

export default pointsHelper
