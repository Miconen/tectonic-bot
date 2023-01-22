import updateUserPoints from "../../database/updateUserPoints.js";
import type { CommandInteraction, Guild, GuildMember } from "discord.js";
import * as rankUtils from "../rankUtils/index.js";
import capitalizeFirstLetter from "../capitalizeFirstLetter.js";

async function givePoints(
    addedPoints: number,
    user: GuildMember,
    interaction: CommandInteraction,
) {
    await interaction.deferReply();

    const { displayName: receivingUser = "???", id: receivingUserId } = user;
    const { displayName: grantingUser = "???", id: grantingUserId } = interaction.member as GuildMember;
    const { id: guildId } = interaction.guild as Guild;

    let newPoints = await updateUserPoints(
        guildId,
        receivingUserId,
        addedPoints,
    );

    let response: string;
    // Check for 0 since it evaluates to false otherwise
    if (newPoints || newPoints === 0) {
        response = `✔ **${receivingUser}** was granted ${addedPoints} points by **${grantingUser}** and now has a total of ${newPoints} points.`;
        let newRank = await rankUtils.rankUpHandler(
            { interaction, target: user, oldPoints: newPoints - addedPoints, newPoints: newPoints },
        );
        // Concatenate level up message to response if user leveled up
        if (newRank) {
            let newRankIcon = rankUtils.rankIcon.get(newRank);
            response += `\n**${receivingUser}** ranked up to ${newRankIcon} ${capitalizeFirstLetter(
                newRank,
            )}!`;
        }
    } else if (newPoints === false) {
        response = `❌ **${receivingUser}** is not an activated user.`;
    } else {
        response = "Error giving points";
    }

    await interaction.editReply(response);
}

export { givePoints };
