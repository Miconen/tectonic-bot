import {ButtonInteraction, CommandInteraction, GuildMember} from "discord.js";
import updateUserPoints from "../../../database/updateUserPoints.js";
import capitalizeFirstLetter from "../../../utility/capitalizeFirstLetter.js";
import * as rankUtils from "../../../utility/rankUtils/index.js"
import {InteractionCache} from "./InteractionCache.js";
import getInteractionId from "./getInteractionId.js";
import isValid from "./isValid.js";

const acceptHelper = async (interaction: ButtonInteraction, state: InteractionCache) => {
    if (!(await isValid(interaction, state))) return;

    let interactionId = getInteractionId(interaction);

    let receivingInteraction = state.interactionMap.get(
        interactionId,
    ) as CommandInteraction;
    let grantingUser = interaction.member as GuildMember;
    let receivingUser = receivingInteraction.member as GuildMember;
    if (!receivingUser) {
        await interaction.reply("Error parsing interaction map");
        console.log("ERROR: Couldn't get interaction from interactionMap");
        return;
    }
    let grantingUserName = grantingUser.displayName;
    let receivingUserName = receivingUser.displayName;

    let addedPoints = state.pointsMap.get(interactionId) ?? 0;
    let totalPoints = await updateUserPoints(
        interaction.guild!.id,
        interaction.message.interaction!.user.id,
        addedPoints,
    );

    let response: string;
    // Check for 0 since it evaluates to false otherwise
    if (totalPoints || totalPoints === 0) {
        response = `✔ **${receivingUserName}** was granted ${addedPoints} points by **${grantingUserName}** and now has a total of ${totalPoints} points.`;
        let newRank = await rankUtils.rankUpHandler(
            { interaction: receivingInteraction, target: receivingUser, oldPoints: totalPoints - addedPoints, newPoints: totalPoints },
        );

        // Concatenate level up message to response if user leveled up
        if (newRank) {
            let newRankIcon = rankUtils.rankIcon.get(newRank);
            response += `\n**${receivingUser}** ranked up to ${newRankIcon} ${capitalizeFirstLetter(
                newRank,
            )}!`;
        }

        // Remove buttons on successful button press
        await receivingInteraction.editReply({
            components: [],
        });
    } else if (totalPoints === false) {
        response = `❌ **${receivingUser}** is not an activated user.`;
    } else {
        response = "Error giving points";
    }

    // Free up memory on point approval
    state.interactionMap.delete(interactionId);
    state.interactionState.delete(interactionId);
    state.pointsMap.delete(interactionId);

    await interaction.reply(response);
}

export default acceptHelper;
