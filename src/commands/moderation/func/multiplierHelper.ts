import { CommandInteraction } from "discord.js"

const multiplierHelper = async (
    multiplier: number,
    interaction: CommandInteraction
) => {
    let newMultiplier = Requests.updateGuild(
        interaction.guild!.id,
        { type: "multiplier", multiplier }
    )

    let response = "Something went wrong..."

    if (newMultiplier) {
        response = `Updated server point multiplier to ${newMultiplier}`
    }

    await interaction.reply(response)
}

export default multiplierHelper
