import type { SplitCache, SplitData } from "@typings/splitTypes.js";
import { getPoints } from "@utils/pointSources";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";

import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	type CommandInteraction,
	type GuildMember,
} from "discord.js";

const splitHelper = async (
	value: number,
	interaction: CommandInteraction,
	state: SplitCache,
) => {
	if (!interaction.channel)
		return await replyHandler(getString("errors", "noChannel"), interaction);
	if (!interaction.guild)
		return await replyHandler(getString("errors", "noGuild"), interaction);

	const points = await getPoints(value, interaction.guild.id);

	const confirm = new ButtonBuilder()
		.setCustomId("buttonAccept")
		.setLabel("Accept")
		.setStyle(ButtonStyle.Success);

	const deny = new ButtonBuilder()
		.setCustomId("buttonDeny")
		.setLabel("Deny")
		.setStyle(ButtonStyle.Danger);

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		confirm,
		deny,
	);

	const username = (interaction.member as GuildMember).displayName;
	await replyHandler(
		getString("splits", "requestSubmitted", { username, points }),
		interaction,
	);

	const message = await interaction.editReply({ components: [row] });

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
