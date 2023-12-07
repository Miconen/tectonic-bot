import { CommandInteraction } from "discord.js"
import IDatabase from "@database/IDatabase"

import { container } from "tsyringe"

const multiplierHelper = async (
    multiplier: number,
    interaction: CommandInteraction
) => {
    const database = container.resolve<IDatabase>("Database")

    let newMultiplier = await database.setPointMultiplier(
        interaction.guild!.id,
        multiplier
    )

    let response: string
    if (newMultiplier) {
        response = `Updated server point multiplier to ${newMultiplier}`
    } else {
        response = "Something went wrong..."
    }

    await interaction.reply(response)
}

export default multiplierHelper
