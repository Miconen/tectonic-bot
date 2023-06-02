import { ButtonInteraction, BaseInteraction } from "discord.js";
import { SplitCache } from "./splitTypes.js";
import * as pointUtils from "../../../utility/pointUtils/index.js"
import getInteractionId from "./getInteractionId.js";

const acceptHelper = async (interaction: ButtonInteraction, state: SplitCache) => {
    let splitId = getInteractionId(interaction);
    let split = state.get(splitId);
    if (!split) {
        await interaction.reply("Split wasn't found in cache");
        console.log("ERROR: Couldn't get SplitData from SplitCache");
        return;
    }

    let receivingUser = split.member;
    let addedPoints = split.points;

    // Remove buttons on button press
    await interaction.message.edit({ components: [] });

    // Free up memory on point approval
    state.delete(splitId);

    const pointsResponse = await pointUtils.givePoints(addedPoints, receivingUser, interaction as BaseInteraction);

    await interaction.reply(pointsResponse);
}

export default acceptHelper;
