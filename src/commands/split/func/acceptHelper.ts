import type { ButtonInteraction, BaseInteraction } from "discord.js";
import type IPointService from "@utils/pointUtils/IPointService"
import type { SplitCache } from "@typings/splitTypes.js";

import getInteractionId from "./getInteractionId.js";
import { container } from "tsyringe"

const acceptHelper = async (interaction: ButtonInteraction, state: SplitCache) => {
    const pointService = container.resolve<IPointService>("PointService")

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

    const pointsResponse = await pointService.givePoints(addedPoints, receivingUser, interaction as BaseInteraction);

    await interaction.reply(pointsResponse);
}

export default acceptHelper;
