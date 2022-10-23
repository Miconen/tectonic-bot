import updateUserPoints from "../data/database/updateUserPoints.js";
import type {CommandInteraction, GuildMember} from "discord.js";
import {rankUpHandler} from "../data/roleHandling.js";

async function givePoints(addedPoints: number, user: GuildMember, interaction: CommandInteraction) {
    let receivingUser = user?.displayName ?? "???";
    let grantingUser = (interaction?.member as GuildMember)?.displayName ?? "???";
    let totalPoints = await updateUserPoints(interaction.guild!.id, user.user.id, addedPoints);

    let response: string;
    // Check for 0 since it evaluates to false otherwise
    if (totalPoints || totalPoints === 0) {
        response = `✔ **${receivingUser}** was granted ${addedPoints} points by **${grantingUser}** and now has a total of ${totalPoints} points.`;
        await rankUpHandler(interaction, user, totalPoints - addedPoints, totalPoints);
    } else if (totalPoints === false) {
        response = `❌ **${receivingUser}** is not an activated user.`;
    } else {
        response = "Error giving points";
    }
    return response;
}

export default givePoints;