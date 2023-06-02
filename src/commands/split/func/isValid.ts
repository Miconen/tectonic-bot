import {ButtonInteraction} from "discord.js";
import {InteractionCache} from "./InteractionCache";
import getInteractionId from "./getInteractionId.js";

const isValid = async (interaction: ButtonInteraction, state: InteractionCache) => {
    let interactionId = getInteractionId(interaction);

    // If command has not been stored in memory, don't run.
    // Idea is not to handle commands that haven't been stored since restart.
    if (!state.interactionState.has(interactionId)) {
        await interaction.reply("❌ Point request expired...");
        return false;
    }
    // If command has been run once, don't run again. Returns true if ran once.
    if (state.interactionState.get(interactionId)) {
        await interaction.reply("❌ Points already handled");
        return false;
    }
    return true;
};

export default isValid;
