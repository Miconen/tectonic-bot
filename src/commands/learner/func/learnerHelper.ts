import type { CommandInteraction, GuildMember } from "discord.js";
import type IPointService from "@utils/pointUtils/IPointService";

import { container } from "tsyringe";
import { getString } from "@utils/stringRepo";
import { replyHandler } from "@utils/replyHandler";
import { getPoints } from "@utils/pointSources";

type PointAmount = "learner_full" | "learner_half";

const learnerHelper = async (
	user: GuildMember,
	interaction: CommandInteraction,
	amount: PointAmount,
) => {
	const pointService = container.resolve<IPointService>("PointService");
	if (!interaction.guild)
		return await replyHandler(getString("errors", "noGuild"), interaction);

	const points = await getPoints(amount, interaction.guild.id);

	// Handle giving of points, returns a string to be sent as a message.
	const pointsResponse = await pointService.givePoints(
		points,
		user,
		interaction,
	);
	await replyHandler(pointsResponse, interaction);
};

export default learnerHelper;
