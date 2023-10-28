import type { CommandInteraction } from "discord.js"
import type IPointService from "../../../utils/pointUtils/IPointService"

import { container } from "tsyringe"

const bumpHelp = async (interaction: CommandInteraction) => {
    const pointService = container.resolve<IPointService>("PointService")

    let points = await pointService.pointsHandler(
        pointService.pointRewards.get("forum_bump") ?? 0,
        interaction.guild!.id
    )

    await interaction.reply(
        `You can gain points for bumping our forum post here: https://secure.runescape.com/m=forum/a=13/c=tuplIA8cxpE/forums?320,321,794,66254540,goto,1\nPoint reward: ${points}`
    )
}

export default bumpHelp
