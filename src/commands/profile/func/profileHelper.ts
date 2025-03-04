import type { CommandInteraction, GuildMember } from "discord.js"
import type IRankService from "@utils/rankUtils/IRankService"
import type IUserService from "@utils/userUtils/IUserService"

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

    let targetUser: GuildMember | undefined
    let targetId = ""
    let isActivated = false

    // Checks the database for an rns
    if (rsn) {
        let userId = Requests.getUser(guildId, { type: "rsn", rsn })

        if (!userId) return `❌ **${rsn}** is not bound to a member.`
        // User exists and is activated
        targetId = userId.user_id
        targetUser = await interaction.guild?.members.fetch(targetId)
        isActivated = true
    }

    // Check user exists if there was no rsn
    if (!isActivated) {
        targetUser = user || (interaction.member as GuildMember)
        targetId = targetUser.id
        isActivated = Boolean(Requests.getUser(guildId, { type: "user_id", user_id: targetId }))
    }

    if (!targetUser) {
        return `❌ Couldn't fetch user.`
    }

    if (!isActivated) {
        return `❌ **${targetUser.displayName}** is not activated.`
    }

    let points = (Requests.getUserPoints(guildId, { type: "user_id", user_id: targetId })) ?? 0

    if (!guildId) return "Invalid guild id, something broke bad??"

    // Rank info and icons
    let nextRankUntil = rankService.pointsToNextRank(points)
    let nextRank = rankService.getRankByPoints(points + nextRankUntil)
    let nextRankIcon = rankService.getIcon(nextRank)
    let currentRank = rankService.getRankByPoints(points)
    let currentRankIcon = rankService.getIcon(currentRank)

    // User accounts
    let accounts = await userService.getAccounts(targetId, guildId)
    let pbs = (await userService.getPbs(targetId, guildId)).sort()

    let response: string
    response = `# ${currentRankIcon} **${targetUser.displayName}**`
    response += `\nCurrent points: ${points}${currentRankIcon}`
    if (currentRank != "wrath") {
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
