import {CommandInteraction} from "discord.js";
import * as pointUtils from "../../../utility/pointUtils/index.js";

const pointsHelp = async (interaction: CommandInteraction) => {
    let response =
        `**Point sources**:\n\n` +
        `**Splits**:\n` +
        `Low value: ${pointUtils.pointRewards.get("split_low")}\n` +
        `Medium value: ${pointUtils.pointRewards.get("split_medium")}\n` +
        `High value: ${pointUtils.pointRewards.get("split_high")}` +
        `\n\n` +
        `**Events**:\n` +
        `Participation: ${pointUtils.pointRewards.get("event_participation")}\n` +
        `Hosting: ${pointUtils.pointRewards.get("event_hosting")}` +
        `\n\n` +
        `**Learners**:\n` +
        `Half: ${pointUtils.pointRewards.get("learner_half")}\n` +
        `Full: ${pointUtils.pointRewards.get("learner_full")}` +
        `\n\n` +
        `**Forum**:\n` +
        `Bumping: ${pointUtils.pointRewards.get("forum_bump")}`;

    await interaction.reply(response);
}

export default pointsHelp;
