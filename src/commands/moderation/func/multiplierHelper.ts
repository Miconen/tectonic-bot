import {CommandInteraction} from "discord.js";
import setPointMultiplier from "../../../database/setPointMultiplier.js";

const multiplierHelper = async (multiplier: number, interaction: CommandInteraction) => {
    let newMultiplier = await setPointMultiplier(
        interaction.guild!.id,
        multiplier,
    );

    let response: string;
    if (newMultiplier) {
        response = `Updated server point multiplier to ${newMultiplier}`;
    } else {
        response = "Something went wrong...";
    }

    await interaction.reply(response);
}

export default multiplierHelper;
