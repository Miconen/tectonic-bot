import type { CommandInteraction, GuildMember } from "discord.js"
import type IRankService from "@utils/rankUtils/IRankService"
import { replyHandler } from "@utils/replyHandler.js"
import { container } from "tsyringe"
import { Requests } from "@requests/main"
import { httpErrorHandler } from "@utils/httpErrorHandler"

const activationHelper = async (
    user: GuildMember,
    rsn: string,
    interaction: CommandInteraction
) => {
    if (!interaction.guild) return
    const rankService = container.resolve<IRankService>("RankService")
    await interaction.deferReply()

    let result = await Requests.createUser(interaction.guild.id, user.user.id, rsn)

    if (result.status === 201) {
        let response = `**${user.user}** has been activated and linked by **${interaction.member}**.`
        // Set default role
        await rankService.addRole(interaction, user, "jade")
        return await replyHandler(response, interaction)
    }

    if (result.status === 409) {
        let response = `❌ **${user.displayName}** is already activated.`
        return await replyHandler(response, interaction)
    }

    let handler = httpErrorHandler(result.status)
    if (handler.error) {
        let response = handler.message
        return await replyHandler(response, interaction)
    }

    return await replyHandler("Something unexpected happened...", interaction)
}

export default activationHelper
