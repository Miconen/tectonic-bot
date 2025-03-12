import type { SplitCache, SplitData } from "@typings/splitTypes.js";
import type IPointService from "@utils/pointUtils/IPointService";

import { CommandInteraction, GuildMember } from "discord.js";
import { container } from "tsyringe";

const splitHelper = async (
	value: number,
	interaction: CommandInteraction,
	state: SplitCache,
) => {
	const pointService = container.resolve<IPointService>("PointService");
	if (!interaction.channel) return;

	value = await pointService.pointsHandler(value, interaction.guild!.id);

	const msg = `**${
		(interaction.member as GuildMember).displayName
	}** has submitted a request for ${value} points. Please wait for admin approval and make sure you have posted a screenshot of your drop as proof.`;
	await interaction.reply({
		content: msg,
	});

	const message = await interaction.fetchReply();

	const split: SplitData = {
		member: interaction.member as GuildMember,
		channel: interaction.channel.id,
		message: message.id,
		points: value,
		timestamp: Date.now(),
	};

	state.set(interaction.id, split);
};

export default splitHelper;
