import { ButtonInteraction } from "discord.js";
import { SplitCache } from "./splitTypes.js";
import getInteractionId from "./getInteractionId.js";

const denyHelper = async (interaction: ButtonInteraction, state: SplitCache) => {
    let splitId = getInteractionId(interaction);
    let split = state.get(splitId);
    if (!split) {
        await interaction.reply("Split wasn't found in cache");
        console.log("ERROR: Couldn't get SplitData from SplitCache");
        return;
    }

    let receivingUser = split.member;
    let receivingUserName = receivingUser.displayName;

    // Remove buttons on successful button press
    await interaction.message.edit({ components: [] });

    // Free up memory on point denial
    state.delete(splitId);

    await interaction.reply(
        `❌ **${receivingUserName}** point request was denied.`,
    );
}

export default denyHelper;
