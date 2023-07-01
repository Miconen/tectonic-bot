import {CommandInteraction, Role} from "discord.js";
import * as pointUtils from "../../../utils/pointUtils/index.js";

const eventHelper = async (users: Role, interaction: CommandInteraction, amount: number) => {
    if (!interaction.guild) return;

    let addedPoints = await pointUtils.pointsHandler(
        amount,
        interaction.guild!.id,
    );

    // Populate the guild members cache for this scope
    await interaction.guild.members.fetch();

    // Handle giving of points, returns a string to be sent as a message.
    const pointsResponse = await pointUtils.givePointsToMultiple(addedPoints, users.members, interaction);
    await interaction.reply(pointsResponse.join("\n"));
}

export default eventHelper;
