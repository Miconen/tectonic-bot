import type { CommandInteraction } from "discord.js"
import type IRankService from "../../../utils/rankUtils/IRankService"

import { container } from "tsyringe"

const ranksHelp = async (interaction: CommandInteraction) => {
    const rankService = container.resolve<IRankService>("RankService")

    let response =
        `## Ranks:\n\n` +
        `${rankService.getIcon("jade")} Jade - ${rankService.getRoleValue(
            "jade"
        )} points\n` +
        `${rankService.getIcon(
            "red_topaz"
        )} Red Topaz - ${rankService.getRoleValue(
            "red_topaz"
        )} points\n` +
        `${rankService.getIcon(
            "sapphire"
        )} Sapphire - ${rankService.getRoleValue("sapphire")} points\n` +
        `${rankService.getIcon(
            "emerald"
        )} Emerald - ${rankService.getRoleValue("emerald")} points\n` +
        `${rankService.getIcon("ruby")} Ruby - ${rankService.getRoleValue(
            "ruby"
        )} points\n` +
        `${rankService.getIcon(
            "diamond"
        )} Diamond - ${rankService.getRoleValue("diamond")} points\n` +
        `${rankService.getIcon(
            "dragonstone"
        )} Dragonstone - ${rankService.getRoleValue(
            "dragonstone"
        )} points\n` +
        `${rankService.getIcon("onyx")} Onyx - ${rankService.getRoleValue(
            "onyx"
        )} points\n` +
        `${rankService.getIcon(
            "zenyte"
        )} Zenyte - ${rankService.getRoleValue("zenyte")} points\n`

    await interaction.reply(response)
}

export default ranksHelp
