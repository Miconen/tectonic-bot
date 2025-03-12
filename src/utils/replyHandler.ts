import { CommandInteraction, TextChannel } from "discord.js";

/**
 * Handles the reply to a Discord interaction, deferring or replying based on context, as you cannot reply to deferred commands.
 */
export async function replyHandler(
	message: string,
	interaction: CommandInteraction,
) {
	const CHARACTER_LIMIT = 2000;

	if (message.length >= CHARACTER_LIMIT) {
		for (const chunk of splitMessage(message, CHARACTER_LIMIT)) {
			await replyer(chunk, interaction, true);
		}

		if (interaction.deferred) {
			await interaction.deleteReply();
		}

		return;
	}

	return await replyer(message, interaction);
}

async function replyer(
	message: string,
	interaction: CommandInteraction,
	split?: boolean,
) {
	if (interaction.channel instanceof TextChannel && split) {
		return await interaction.channel.send(message);
	}

	if (interaction.deferred) {
		return await interaction.followUp(message);
	}

	return await interaction.reply(message);
}

function splitMessage(message: string, CHARACTER_LIMIT: number) {
	const chunks = [];

	while (message.length > CHARACTER_LIMIT) {
		let lastLineBreakIndex = message.lastIndexOf("\n", CHARACTER_LIMIT - 1);
		if (lastLineBreakIndex === -1) {
			lastLineBreakIndex = CHARACTER_LIMIT;
		}

		chunks.push(message.substring(0, lastLineBreakIndex));
		message = message.substring(lastLineBreakIndex).trim();
	}

	// Add the remaining part of the message
	chunks.push(message);

	return chunks;
}
