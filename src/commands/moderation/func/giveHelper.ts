import {CommandInteraction, GuildMember} from "discord.js";
import * as pointUtils from "../../../utils/pointUtils/index.js";

const giveHelper = async (user: GuildMember, addedPoints: number, interaction: CommandInteraction) => {
    // Handle giving of points, returns a string to be sent as a message.
    let pointsResponse = await pointUtils.givePoints(addedPoints, user, interaction);
    await interaction.reply(pointsResponse);
}

export default giveHelper;
