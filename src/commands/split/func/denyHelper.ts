import type { SplitData } from "@typings/splitTypes";
import { getString } from "@utils/stringRepo";
import type { CommandInteraction, TextChannel } from "discord.js";

const denyHelper = async (
	interaction: CommandInteraction,
	split: SplitData,
) => {
	const receivingUser = split.member;
	const receivingUserName = receivingUser.displayName;

	const channel = (await interaction.client.channels.fetch(
		split.channel,
	)) as TextChannel;
	if (!channel) return "Channel not found";
	await channel.messages.delete(split.message);

	return getString("splits", "denied", { username: receivingUserName });
};

export default denyHelper;
