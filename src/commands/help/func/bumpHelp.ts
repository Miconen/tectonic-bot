import {CommandInteraction} from "discord.js";
import * as pointUtils from "../../../utility/pointUtils/index.js";

const bumpHelp = async (interaction: CommandInteraction) => {
    let points = await pointUtils.pointsHandler(
        pointUtils.pointRewards.get("forum_bump"),
        interaction.guild!.id,
    );

    await interaction.reply(
        `You can gain points for bumping our forum post here: https://secure.runescape.com/m=forum/a=13/c=tuplIA8cxpE/forums?320,321,794,66254540,goto,1\nPoint reward: ${points}`,
    );
}

export default bumpHelp;
