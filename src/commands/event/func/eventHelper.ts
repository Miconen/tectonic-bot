import {CommandInteraction, GuildMember} from "discord.js";
import IsAdmin from "../../../utility/isAdmin.js";
import * as pointUtils from "../../../utility/pointUtils/index.js";

type PointAmount = "event_participation" | "event_hosting";

const learnerHelper = async (user: GuildMember, interaction: CommandInteraction, amount: PointAmount) => {
    if (!IsAdmin(Number(interaction.member?.permissions))) return;

    let addedPoints = await pointUtils.pointsHandler(
        pointUtils.pointRewards.get(amount),
        interaction.guild!.id,
    );

    // Handle giving of points, returns a string to be sent as a message.
    const pointsResponse = await pointUtils.givePoints(addedPoints, user, interaction);
    await interaction.reply(pointsResponse);
}

export default learnerHelper;
