import { SplitData } from "@typings/splitTypes";
import { CommandInteraction, TextChannel } from "discord.js";

const denyHelper = async (
	interaction: CommandInteraction,
	split: SplitData,
) => {
	let receivingUser = split.member;
	let receivingUserName = receivingUser.displayName;

	const channel = (await interaction.client.channels.fetch(
		split.channel,
	)) as TextChannel;
	if (!channel) return "Channel not found";
	await channel.messages.delete(split.message);

	return `❌ **${receivingUserName}** point request was denied.`;
};

export default denyHelper;
