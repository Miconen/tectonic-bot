import type { SplitCache, SplitData } from "@typings/splitTypes.js";
import type IPointService from "@utils/pointUtils/IPointService";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";

import type { CommandInteraction, GuildMember } from "discord.js";
import { container } from "tsyringe";

const splitHelper = async (
	value: number,
	interaction: CommandInteraction,
	state: SplitCache,
) => {
	const pointService = container.resolve<IPointService>("PointService");
	if (!interaction.channel) return;
	if (!interaction.guild) return;

	const points = await pointService.pointsHandler(value, interaction.guild.id);

	const username = (interaction.member as GuildMember).displayName;
	await replyHandler(
		getString("splits", "requestSubmitted", { username, points }),
		interaction,
	);

	const message = await interaction.fetchReply();

	const split: SplitData = {
		member: interaction.member as GuildMember,
		channel: interaction.channel.id,
		message: message.id,
		points,
		timestamp: Date.now(),
	};

	state.set(interaction.id, split);
};

export default splitHelper;
