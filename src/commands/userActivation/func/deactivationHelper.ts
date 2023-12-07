import type { CommandInteraction, GuildMember } from "discord.js"
import type IRankService from "../../../utils/rankUtils/IRankService"
import type IDatabase from "@database/IDatabase"

import { container } from "tsyringe"

const deactivationHelper = async (
    user: GuildMember,
    interaction: CommandInteraction
) => {
    const rankService = container.resolve<IRankService>("RankService")
    const database = container.resolve<IDatabase>("Database")

    let result = await database.removeUser(interaction.guildId!, user.user.id)

    let response: string
    if (result) {
        response = `✔ **${user.displayName}** has been deactivated.`
        // Remove all rank roles
        await rankService.removeOldRoles(user)
    } else {
        response = `❌ **${user.displayName}** is not activated.`
    }
    // response = 'Error checking if user is activated';

    await interaction.reply(response)
}

export default deactivationHelper
