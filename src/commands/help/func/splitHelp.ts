import type IPointService from "@utils/pointUtils/IPointService";
import type { CommandInteraction } from "discord.js";

import { getString } from "@utils/stringRepo";
import { container } from "tsyringe";
import { replyHandler } from "@utils/replyHandler";

const splitHelp = async (interaction: CommandInteraction) => {
	if (!interaction.guild)
		return await interaction.reply(getString("errors", "noGuild"));
	const pointService = container.resolve<IPointService>("PointService");

	const points_low = await pointService.pointsHandler(
		pointService.pointRewards.get("split_low") ?? 0,
		interaction.guild.id,
	);
	const points_medium = await pointService.pointsHandler(
		pointService.pointRewards.get("split_medium") ?? 0,
		interaction.guild.id,
	);
	const points_high = await pointService.pointsHandler(
		pointService.pointRewards.get("split_high") ?? 0,
		interaction.guild.id,
	);

	await replyHandler(
		getString("splits", "helpText", {
			lowPoints: points_low,
			mediumPoints: points_medium,
			highPoints: points_high,
		}),
		interaction,
	);
};

export default splitHelp;
