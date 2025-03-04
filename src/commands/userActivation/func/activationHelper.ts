import type { CommandInteraction, GuildMember } from "discord.js"
import type IRankService from "../../../utils/rankUtils/IRankService"
import { getWomId } from "../../rsn/func/rsnHelpers.js"
import { replyHandler } from "../../../utils/replyHandler.js"

import { container } from "tsyringe"

const activationHelper = async (
    user: GuildMember,
    rsn: string,
    interaction: CommandInteraction
) => {
    if (!interaction.guild?.id) return

    const rankService = container.resolve<IRankService>("RankService")

    await interaction.deferReply()

    let womId = await getWomId(rsn)
    if (!womId.success) {
        return await replyHandler(womId.error, interaction)
    }

    let result = Requests.createUser(interaction.guildId!, user.user.id, rsn)

    let response: string
    if (result) {
        response = `**${user.user}** has been activated and linked by **${interaction.member}**.`
        // Set default role
        await rankService.addRole(interaction, user, "jade")
    } else {
        response = `❌ **${user.displayName}** is already activated.`
    }

    await replyHandler(response, interaction)
}

export default activationHelper
