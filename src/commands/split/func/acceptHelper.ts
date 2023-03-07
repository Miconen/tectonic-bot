import {ButtonInteraction, CommandInteraction, GuildMember, BaseInteraction} from "discord.js";
import * as pointUtils from "../../../utility/pointUtils/index.js"
import {InteractionCache} from "./InteractionCache.js";
import getInteractionId from "./getInteractionId.js";
import isValid from "./isValid.js";

const acceptHelper = async (interaction: ButtonInteraction, state: InteractionCache) => {
    
    if (!(await isValid(interaction, state))) return;

    let interactionId = getInteractionId(interaction);

    let receivingInteraction = state.interactionMap.get(
        interactionId,
    ) as CommandInteraction;

    let receivingUser = receivingInteraction.member as GuildMember;
    if (!receivingUser) {
        await interaction.reply("Error parsing interaction map");
        console.log("ERROR: Couldn't get interaction from interactionMap");
        return;
    }

    let addedPoints = state.pointsMap.get(interactionId) ?? 0;

    // Remove buttons on button press
    await receivingInteraction.editReply({
        components: [],
    });

    // Free up memory on point approval
    state.interactionMap.delete(interactionId);
    state.interactionState.delete(interactionId);
    state.pointsMap.delete(interactionId);

    const pointsResponse = await pointUtils.givePoints(addedPoints, receivingUser, interaction as BaseInteraction);

    await interaction.reply(pointsResponse);
}

export default acceptHelper;