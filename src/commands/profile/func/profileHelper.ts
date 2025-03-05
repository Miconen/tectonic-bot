import type { CommandInteraction, GuildMember } from "discord.js"
import type IRankService from "@utils/rankUtils/IRankService"
import type IUserService from "@utils/userUtils/IUserService"
import { Requests } from "@requests/main.js"
import { User } from "@typings/requests.js"

import { container } from "tsyringe"

const pointsHelper = async (
    user: GuildMember | null,
    rsn: string | null,
    interaction: CommandInteraction
) => {
    if (!interaction.guild) return `❌ Critical error determining guild.`
    let guildId = interaction.guild.id

    const rankService = container.resolve<IRankService>("RankService")
    const userService = container.resolve<IUserService>("UserService")

    let foundUser: User | undefined
    let targetUser: GuildMember | undefined
    let targetId = ""

    // User wants to check self
    if (!rsn && !user) {
        let res = await Requests.getUser(guildId, { type: "user_id", user_id: interaction.user.id })
        if (res.error) return `❌ **${(interaction.member as GuildMember).displayName}** is not activated.`

        foundUser = res.data
        targetId = interaction.user.id
        targetUser = interaction.member as GuildMember
    }

    // Checks the database for an rns
    if (rsn) {
        let res = await Requests.getUser(guildId, { type: "rsn", rsn })
        if (res.error) return `❌ **${rsn}** is not bound to a known member.`

        // User exists and is activated
        foundUser = res.data
        targetId = res.data.user_id
        targetUser = await interaction.guild.members.fetch(targetId)
    }

    if (user) {
        let res = await Requests.getUser(guildId, { type: "user_id", user_id: user.user.id })
        if (res.error) return `❌ **${user.displayName}** is not activated.`

        foundUser = res.data
        targetId = user.id
        targetUser = user
    }

    if (!foundUser || !targetUser) {
        return `❌ Error fetching user data.`
    }

    let points = foundUser.points

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
