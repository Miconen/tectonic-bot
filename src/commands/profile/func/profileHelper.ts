import type { CommandInteraction, GuildMember } from "discord.js"
import type IRankService from "../../../utils/rankUtils/IRankService"
import type IUserService from "../../../utils/userUtils/IUserService"
import type IDatabase from "@database/IDatabase"

import { container } from "tsyringe"

const pointsHelper = async (
    user: GuildMember | null,
    rsn: string | null,
    interaction: CommandInteraction
) => {
    let guildId = interaction.guildId
    if (!guildId) return `❌ Critical error determining guild.`

    const rankService = container.resolve<IRankService>("RankService")
    const userService = container.resolve<IUserService>("UserService")
    const database = container.resolve<IDatabase>("Database")

    let targetUser: GuildMember | undefined
    let targetId = ""
    let isActivated = false

    // Checks the database for an rns
    if (rsn) {
        let userId = await database.getUserByRsn(guildId, rsn)
        if (!userId) return `❌ **${rsn}** is not bound to a member.`
        // User exists and is activated
        targetId = userId
        targetUser = await interaction.guild?.members.fetch(targetId)
        isActivated = true
    }

    // Check user exists if there was no rsn
    if (!isActivated) {
        targetUser = user || (interaction.member as GuildMember)
        targetId = targetUser.id
        isActivated = await database.userExists(guildId, targetId)
    }

    if (!targetUser) {
        return `❌ Couldn't fetch user.`
    }

    if (!isActivated) {
        return `❌ **${targetUser.displayName}** is not activated.`
    }

    let points = (await database.getPoints(interaction.guildId!, targetId)) ?? 0
    if (!guildId) return "Invalid guild id, something broke bad??"

    // Rank info and icons
    let nextRankUntil = rankService.pointsToNextRank(points)
    let nextRank = rankService.getRankByPoints(points + nextRankUntil)
    let nextRankIcon = rankService.getIcon(nextRank)
    let currentRank = rankService.getRankByPoints(points)
    let currentRankIcon = rankService.getIcon(currentRank)

    // User accounts
    let accounts = await userService.getAccounts(targetId, guildId)
    let pbs = await userService.getPbs(targetId, guildId)

    let response: string
    response = `# ${currentRankIcon} **${targetUser.displayName}**`
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
