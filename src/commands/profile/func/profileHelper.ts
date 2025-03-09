import type { CommandInteraction, GuildMember } from "discord.js"
import type IRankService from "@utils/rankUtils/IRankService"
import { Requests } from "@requests/main.js"
import { UserParam } from "@typings/requests.js"

import { container } from "tsyringe"
import TimeConverter from "@commands/pb/func/TimeConverter"

const pointsHelper = async (
    member: GuildMember | null,
    rsn: string | null,
    interaction: CommandInteraction
) => {
    if (!interaction.guild) return `❌ Critical error determining guild.`
    let guildId = interaction.guild.id

    const rankService = container.resolve<IRankService>("RankService")

    let query: UserParam | undefined
    let errorMsg = `❌ Error fetching user data.`

    if (!member) {
        member = interaction.member as GuildMember
    }

    // User wants to check self
    if (!rsn) {
        query = { type: "user_id", user_id: member.id }
        errorMsg = `❌ **${member.displayName}** is not activated.`
    }

    // Checks the database for an rns
    if (rsn) {
        query = { type: "rsn", rsn }
        errorMsg = `❌ **${rsn}** is not bound to a known member.`
    }

    if (!query) {
        return errorMsg
    }

    const res = await Requests.getUser(guildId, query)
    if (res.error) return errorMsg
    member = await interaction.guild.members.fetch(res.data.user_id)

    const user = res.data
    const points = user.points

    // Rank info and icons
    let nextRankUntil = rankService.pointsToNextRank(points)
    let nextRank = rankService.getRankByPoints(points + nextRankUntil)
    let nextRankIcon = rankService.getIcon(nextRank)
    let currentRank = rankService.getRankByPoints(points)
    let currentRankIcon = rankService.getIcon(currentRank)

    let response: string
    response = `# ${currentRankIcon} **${member.displayName}**`
    response += `\nCurrent points: ${points}${currentRankIcon}`
    if (currentRank != "wrath") {
        response += `\nPoints to next level: ${nextRankUntil}${nextRankIcon}`
    }
    if (user.rsns.length) {
        response += "\n# Accounts"
        user.rsns.forEach((account) => {
            response += `\n\`${account.rsn}\``
        })
    }
    else {
        response += "\n`Link your OSRS account to be eligible for event rank points`"
    }
    if (user.times.length) {
        response += "\n# Clan PBs"
        user.times.forEach((pb) => {
            response += `\n\`${pb.category} | ${pb.display_name}\` - \`${TimeConverter.ticksToTime(pb.time)} (${pb.time} ticks)\``
        })
    }

    return response
}

export default pointsHelper
