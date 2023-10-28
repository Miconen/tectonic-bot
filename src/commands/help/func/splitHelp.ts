import { CommandInteraction } from "discord.js";
import type IPointService from "../../../utils/pointUtils/IPointService"

import { container } from "tsyringe"

const splitHelp = async (interaction: CommandInteraction) => {
    const pointService = container.resolve<IPointService>("PointService")

    let points_low = await pointService.pointsHandler(
        pointService.pointRewards.get("split_low") ?? 0,
        interaction.guild!.id,
    );
    let points_medium = await pointService.pointsHandler(
        pointService.pointRewards.get("split_medium") ?? 0,
        interaction.guild!.id,
    );
    let points_high = await pointService.pointsHandler(
        pointService.pointRewards.get("split_high") ?? 0,
        interaction.guild!.id,
    );

    await interaction.reply(
        `Gain points for recieving a drop and splitting with your clan mates, screenshot of loot and teammates names required as proof.\nRequires user to be an activated user\nPoint rewards: ${points_low}, ${points_medium} & ${points_high}`,
    );
}

export default splitHelp;
