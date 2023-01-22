import {CommandInteraction, GuildMember} from "discord.js";
import IsAdmin from "../../../utility/isAdmin";
import * as pointUtils from "../../../utility/pointUtils/index.js";

type PointAmount = "learner_full" | "learner_half";

const learnerHelper = async (user: GuildMember, interaction: CommandInteraction, amount: PointAmount) => {
    if (!IsAdmin(Number(interaction.member?.permissions))) return;

    let addedPoints = await pointUtils.pointsHandler(
        pointUtils.pointRewards.get(amount),
        interaction.guild!.id,
    );

    // Handle giving of points, returns a string to be sent as a message.
    await pointUtils.givePoints(addedPoints, user, interaction);
}

export default learnerHelper;