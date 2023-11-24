import { CommandInteraction, GuildMember } from "discord.js"
import type IDatabase from "@database/IDatabase"

import { container } from "tsyringe"

const statusHelper = async (
    user: GuildMember,
    interaction: CommandInteraction
) => {
    const database = container.resolve<IDatabase>("Database")

    let result = await database.getUser(interaction.guildId!, user.user.id)

    let response: string
    if (result) {
        response = `✔ **${user.displayName}** is activated.`
    } else {
        response = `❌ **${user.displayName}** is not activated.`
    }
    // response = 'Error checking if user is activated';

    await interaction.reply(response)
}

export default statusHelper
