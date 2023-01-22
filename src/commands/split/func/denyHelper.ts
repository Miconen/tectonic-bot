import {ButtonInteraction, CommandInteraction, GuildMember} from "discord.js";
import {InteractionCache} from "./InteractionCache";
import isValid from "./isValid.js";
import getInteractionId from "./getInteractionId.js";

const denyHelper = async (interaction: ButtonInteraction, state: InteractionCache) => {
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
    let receivingUserName = receivingUser.displayName;

    // Remove buttons on successful button press
    await receivingInteraction.editReply({
        components: [],
    });

    // Free up memory on point denial
    state.interactionMap.delete(interactionId);
    state.interactionState.delete(interactionId);
    state.pointsMap.delete(interactionId);

    await interaction.reply(
        `❌ **${receivingUserName}** point request was denied.`,
    );
}

export default denyHelper;
