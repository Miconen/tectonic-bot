import type { CommandInteraction, TextChannel } from "discord.js";
import type IPointService from "@utils/pointUtils/IPointService";
import type { SplitData } from "@typings/splitTypes.js";

import { container } from "tsyringe";

const acceptHelper = async (
	interaction: CommandInteraction,
	split: SplitData,
) => {
	const pointService = container.resolve<IPointService>("PointService");

	const receivingUser = split.member;
	const addedPoints = split.points;

	const channel = (await interaction.client.channels.fetch(
		split.channel,
	)) as TextChannel;
	if (!channel) return "Channel not found";
	await channel.messages.delete(split.message);

	const pointsResponse = await pointService.givePoints(
		addedPoints,
		receivingUser,
		interaction,
	);
	return pointsResponse;
};

export default acceptHelper;
