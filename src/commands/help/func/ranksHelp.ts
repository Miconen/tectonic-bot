import { CommandInteraction } from "discord.js";
import * as rankUtils from "../../../utils/rankUtils/index.js";

const ranksHelp = async (interaction: CommandInteraction) => {
    let response =
        `**Ranks**:\n\n` +
        `${rankUtils.rankIcon.get("jade")} Jade - ${rankUtils.roleValuesByName.get(
            "jade",
        )} points\n` +
        `${rankUtils.rankIcon.get("red_topaz")} Red Topaz - ${rankUtils.roleValuesByName.get(
            "red_topaz",
        )} points\n` +
        `${rankUtils.rankIcon.get("sapphire")} Sapphire - ${rankUtils.roleValuesByName.get(
            "sapphire",
        )} points\n` +
        `${rankUtils.rankIcon.get("emerald")} Emerald - ${rankUtils.roleValuesByName.get(
            "emerald",
        )} points\n` +
        `${rankUtils.rankIcon.get("ruby")} Ruby - ${rankUtils.roleValuesByName.get(
            "ruby",
        )} points\n` +
        `${rankUtils.rankIcon.get("diamond")} Diamond - ${rankUtils.roleValuesByName.get(
            "diamond",
        )} points\n` +
        `${rankUtils.rankIcon.get(
            "dragonstone",
        )} Dragonstone - ${rankUtils.roleValuesByName.get("dragonstone")} points\n` +
        `${rankUtils.rankIcon.get("onyx")} Onyx - ${rankUtils.roleValuesByName.get(
            "onyx",
        )} points\n` +
        `${rankUtils.rankIcon.get("zenyte")} Zenyte - ${rankUtils.roleValuesByName.get(
            "zenyte",
        )} points\n`;

    await interaction.reply(response);
}

export default ranksHelp;
