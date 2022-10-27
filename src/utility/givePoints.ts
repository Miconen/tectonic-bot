import updateUserPoints from "../data/database/updateUserPoints.js";
import type { CommandInteraction, GuildMember } from "discord.js";
import { rankUpHandler } from "../data/roleHandling.js";
import { roleIcon } from "../data/iconData.js";
import capitalizeFirstLetter from "./capitalizeFirstLetter.js";

async function givePoints(
    addedPoints: number,
    user: GuildMember,
    interaction: CommandInteraction,
) {
    await interaction.deferReply();

    let receivingUser = user?.displayName ?? "???";
    let grantingUser =
        (interaction?.member as GuildMember)?.displayName ?? "???";
    let totalPoints = await updateUserPoints(
        interaction.guild!.id,
        user.user.id,
        addedPoints,
    );

    let response: string;
    // Check for 0 since it evaluates to false otherwise
    if (totalPoints || totalPoints === 0) {
        response = `✔ **${receivingUser}** was granted ${addedPoints} points by **${grantingUser}** and now has a total of ${totalPoints} points.`;
        let newRank = await rankUpHandler(
            interaction,
            user,
            totalPoints - addedPoints,
            totalPoints,
        );
        // Concatenate level up message to response if user leveled up
        if (newRank) {
            let newRankIcon = roleIcon.get(newRank);
            response += `\n**${receivingUser}** ranked up to ${newRankIcon} ${capitalizeFirstLetter(
                newRank,
            )}!`;
        }
    } else if (totalPoints === false) {
        response = `❌ **${receivingUser}** is not an activated user.`;
    } else {
        response = "Error giving points";
    }

    await interaction.editReply(response);
}

export default givePoints;
