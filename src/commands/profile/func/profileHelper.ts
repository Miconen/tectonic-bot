import type { CommandInteraction, GuildMember } from "discord.js"
import type IRankService from "../../../utils/rankUtils/IRankService"
import type IUserService from "../../../utils/userUtils/IUserService"
import type IDatabase from "@database/IDatabase"

import { container } from "tsyringe"

const pointsHelper = async (
    user: GuildMember | null,
    interaction: CommandInteraction
) => {
    const rankService = container.resolve<IRankService>("RankService")
    const userService = container.resolve<IUserService>("UserService")
    const database = container.resolve<IDatabase>("Database")

    let guildId = interaction.guildId
    if (!guildId) return "Invalid guild id, something broke bad??"
    let targetUser = user?.user?.id ?? interaction.user.id ?? "0"
    let targetUserName =
        user?.displayName ??
        (interaction.member as GuildMember).displayName ??
        "???"
    let points = await database.getPoints(interaction.guildId!, targetUser)

    if (points === undefined) {
        return `❌ **${targetUserName}** is not activated.`
    }

    // Rank info and icons
    let nextRankUntil = rankService.pointsToNextRank(points)
    let nextRank = rankService.getRankByPoints(points + nextRankUntil)
    let nextRankIcon = rankService.getIcon(nextRank)
    let currentRank = rankService.getRankByPoints(points)
    let currentRankIcon = rankService.getIcon(currentRank)

    // User accounts
    let accounts = await userService.getAccounts(targetUser, guildId)
    let pbs = await userService.getPbs(targetUser, guildId)

    let response: string
    response = `# ${currentRankIcon} **${targetUserName}**`
    response += `\nCurrent points: ${points}${currentRankIcon}`
    if (currentRank != "zenyte") {
        response += `\nPoints to next level: ${nextRankUntil}${nextRankIcon}`
    }
    if (accounts.length) {
        response += "\n# Accounts"
        accounts.forEach((account) => {
            response += `\n\`${account}\``
        })
    }
    // else {
    //     response += "\n`Link your OSRS account to be eligible for event rank points`"
    // }
    if (pbs.length) {
        response += "\n# Clan PBs"
        pbs.forEach((pb) => {
            response += `\n\`${pb.boss}\` - \`${pb.time}\``
        })
    }

    return response
}

export default pointsHelper
