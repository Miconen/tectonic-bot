import {CommandInteraction, GuildMember} from "discord.js";
import IsAdmin from "../../../utility/isAdmin.js";
import * as pointUtils from "../../../utility/pointUtils/index.js";

const giveHelper = async (user: GuildMember, addedPoints: number, interaction: CommandInteraction) => {
    if (!IsAdmin(Number(interaction.member?.permissions))) return;

    // Handle giving of points, returns a string to be sent as a message.
    await pointUtils.givePoints(addedPoints, user, interaction);
}

export default giveHelper;
