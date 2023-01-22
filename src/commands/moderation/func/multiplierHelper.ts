import {CommandInteraction} from "discord.js";
import IsAdmin from "../../../utility/isAdmin.js";
import setPointMultiplier from "../../../database/setPointMultiplier.js";

const multiplierHelper = async (multiplier: number, interaction: CommandInteraction) => {
    if (!IsAdmin(Number(interaction.member?.permissions))) return;

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