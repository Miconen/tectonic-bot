import { CommandInteraction } from "discord.js";
import * as pointUtils from "../../../utility/pointUtils/index.js";

const splitHelp = async (interaction: CommandInteraction) => {
    let points_low = await pointUtils.pointsHandler(
        pointUtils.pointRewards.get("split_low"),
        interaction.guild!.id,
    );
    let points_medium = await pointUtils.pointsHandler(
        pointUtils.pointRewards.get("split_medium"),
        interaction.guild!.id,
    );
    let points_high = await pointUtils.pointsHandler(
        pointUtils.pointRewards.get("split_high"),
        interaction.guild!.id,
    );

    await interaction.reply(
        `Gain points for recieving a drop and splitting with your clan mates, screenshot of loot and teammates names required as proof.\nRequires user to be an activated user\nPoint rewards: ${points_low}, ${points_medium} & ${points_high}`,
    );
}

export default splitHelp;
