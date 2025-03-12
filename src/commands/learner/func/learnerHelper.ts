import type { CommandInteraction, GuildMember } from "discord.js";
import type IPointService from "@utils/pointUtils/IPointService";

import { container } from "tsyringe";
import { getString } from "@utils/stringRepo";

type PointAmount = "learner_full" | "learner_half";

const learnerHelper = async (
	user: GuildMember,
	interaction: CommandInteraction,
	amount: PointAmount,
) => {
	const pointService = container.resolve<IPointService>("PointService");
	if (!interaction.guild)
		return await interaction.reply(getString("errors", "noGuild"));

	const addedPoints = await pointService.pointsHandler(
		pointService.pointRewards.get(amount) ?? 0,
		interaction.guild.id,
	);

	// Handle giving of points, returns a string to be sent as a message.
	const pointsResponse = await pointService.givePoints(
		addedPoints,
		user,
		interaction,
	);
	await interaction.reply(pointsResponse);
};

export default learnerHelper;
