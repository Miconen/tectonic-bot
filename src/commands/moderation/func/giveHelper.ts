import type {CommandInteraction, GuildMember} from "discord.js";
import type IPointService from "../../../utils/pointUtils/IPointService"

import { container } from "tsyringe"

const giveHelper = async (user: GuildMember, addedPoints: number, interaction: CommandInteraction) => {
    const pointService = container.resolve<IPointService>("PointService")

    // Handle giving of points, returns a string to be sent as a message.
    let pointsResponse = await pointService.givePoints(addedPoints, user, interaction);
    await interaction.reply(pointsResponse);
}

export default giveHelper;
