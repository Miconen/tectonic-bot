import type { CommandInteraction } from "discord.js"
import type IRankService from "../../../utils/rankUtils/IRankService"

import { container } from "tsyringe"

const ranksHelp = async (interaction: CommandInteraction) => {
    const rankService = container.resolve<IRankService>("RankService")

    let response =
        `## Ranks:\n\n` +
        `${rankService.getIcon("jade")} Jade - ${rankService.getRoleValueByName(
            "jade"
        )} points\n` +
        `${rankService.getIcon(
            "red_topaz"
        )} Red Topaz - ${rankService.getRoleValueByName(
            "red_topaz"
        )} points\n` +
        `${rankService.getIcon(
            "sapphire"
        )} Sapphire - ${rankService.getRoleValueByName("sapphire")} points\n` +
        `${rankService.getIcon(
            "emerald"
        )} Emerald - ${rankService.getRoleValueByName("emerald")} points\n` +
        `${rankService.getIcon("ruby")} Ruby - ${rankService.getRoleValueByName(
            "ruby"
        )} points\n` +
        `${rankService.getIcon(
            "diamond"
        )} Diamond - ${rankService.getRoleValueByName("diamond")} points\n` +
        `${rankService.getIcon(
            "dragonstone"
        )} Dragonstone - ${rankService.getRoleValueByName(
            "dragonstone"
        )} points\n` +
        `${rankService.getIcon("onyx")} Onyx - ${rankService.getRoleValueByName(
            "onyx"
        )} points\n` +
        `${rankService.getIcon(
            "zenyte"
        )} Zenyte - ${rankService.getRoleValueByName("zenyte")} points\n`

    await interaction.reply(response)
}

export default ranksHelp
