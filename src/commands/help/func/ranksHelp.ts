import type { CommandInteraction } from "discord.js";
import type IRankService from "../../../utils/rankUtils/IRankService"

import { container } from "tsyringe"

const ranksHelp = async (interaction: CommandInteraction) => {
    const rankService = container.resolve<IRankService>("RankService")

    let response =
        `**Ranks**:\n\n` +
        `${rankService.rankIcon.get("jade")} Jade - ${rankService.getRoleValueByName(
            "jade",
        )} points\n` +
        `${rankService.rankIcon.get("red_topaz")} Red Topaz - ${rankService.getRoleValueByName(
            "red_topaz",
        )} points\n` +
        `${rankService.rankIcon.get("sapphire")} Sapphire - ${rankService.getRoleValueByName(
            "sapphire",
        )} points\n` +
        `${rankService.rankIcon.get("emerald")} Emerald - ${rankService.getRoleValueByName(
            "emerald",
        )} points\n` +
        `${rankService.rankIcon.get("ruby")} Ruby - ${rankService.getRoleValueByName(
            "ruby",
        )} points\n` +
        `${rankService.rankIcon.get("diamond")} Diamond - ${rankService.getRoleValueByName(
            "diamond",
        )} points\n` +
        `${rankService.rankIcon.get(
            "dragonstone",
        )} Dragonstone - ${rankService.getRoleValueByName("dragonstone")} points\n` +
        `${rankService.rankIcon.get("onyx")} Onyx - ${rankService.getRoleValueByName(
            "onyx",
        )} points\n` +
        `${rankService.rankIcon.get("zenyte")} Zenyte - ${rankService.getRoleValueByName(
            "zenyte",
        )} points\n`;

    await interaction.reply(response);
}

export default ranksHelp;
