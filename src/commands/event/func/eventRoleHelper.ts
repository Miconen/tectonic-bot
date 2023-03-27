import {CommandInteraction, GuildMember, Role} from "discord.js";
import IsAdmin from "../../../utility/isAdmin.js";
import * as pointUtils from "../../../utility/pointUtils/index.js";

const eventHelper = async (users: Role, interaction: CommandInteraction, amount: number) => {
    if (!IsAdmin(Number(interaction.member?.permissions))) return;
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
