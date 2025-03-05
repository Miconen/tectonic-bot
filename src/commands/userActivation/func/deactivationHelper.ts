import type { CommandInteraction, GuildMember } from "discord.js"
import type IRankService from "@utils/rankUtils/IRankService"
import { Requests } from "@requests/main.js"

import { container } from "tsyringe"
import { httpErrorHandler } from "@utils/httpErrorHandler"
import { replyHandler } from "@utils/replyHandler"

const deactivationHelper = async (
    user: GuildMember,
    interaction: CommandInteraction
) => {
    if (!interaction.guild) return
    const rankService = container.resolve<IRankService>("RankService")
    await interaction.deferReply()

    let result = await Requests.removeUser(interaction.guild.id, { type: "user_id", user_id: user.user.id })

    if (result.status === 204) {
        let response = `✔ **${user.displayName}** has been deactivated.`
        // Remove all rank roles
        await rankService.removeOldRoles(user)
        return await replyHandler(response, interaction)
    }

    if (result.status === 404) {
        let response = `❌ **${user.displayName}** is not activated.`
        return await replyHandler(response, interaction)
    }

    let handler = httpErrorHandler(result.status)
    if (handler.error) {
        let response = handler.message
        return await replyHandler(response, interaction)
    }

    return await replyHandler("Something unexpected happened...", interaction)
}

export default deactivationHelper
