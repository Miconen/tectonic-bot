import type { CommandInteraction, Role } from "discord.js";
import type IPointService from "@utils/pointUtils/IPointService";
import { replyHandler } from "@utils/replyHandler.js";

import { container } from "tsyringe";
import { getString } from "@utils/stringRepo";
import { getPoints } from "@utils/pointSources";

const eventHelper = async (
	users: Role,
	interaction: CommandInteraction,
	amount: number,
) => {
	const pointService = container.resolve<IPointService>("PointService");
	if (!interaction.guild)
		return await interaction.reply(getString("errors", "noGuild"));

	await interaction.deferReply();

	const points = await getPoints(amount, interaction.guild.id);

	// Populate the guild members cache for this scope
	await interaction.guild.members.fetch();

	// Handle giving of points, returns a string to be sent as a message.
	const pointsResponse = await pointService.givePointsToMultiple(
		points,
		users.members,
		interaction,
	);

	await replyHandler(pointsResponse.join("\n"), interaction);
};

export default eventHelper;
