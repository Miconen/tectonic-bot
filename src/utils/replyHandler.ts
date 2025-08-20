import type { ButtonInteraction } from "discord.js";
import { CommandInteraction, TextChannel } from "discord.js";

/**
 * Handles the reply to a Discord interaction, deferring or replying based on context, as you cannot reply to deferred commands.
 */
export async function replyHandler(
	message: string,
	interaction: CommandInteraction | ButtonInteraction,
	options?: { ephemeral?: boolean },
) {
	const CHARACTER_LIMIT = 2000;

	if (message.length >= CHARACTER_LIMIT) {
		for (const chunk of splitMessage(message, CHARACTER_LIMIT)) {
			await replyer(chunk, interaction, true, options);
		}

		if (interaction instanceof CommandInteraction && interaction.deferred) {
			await interaction.deleteReply();
		}

		return;
	}

	return await replyer(message, interaction, false, options);
}

async function replyer(
	message: string,
	interaction: CommandInteraction | ButtonInteraction,
	split?: boolean,
	options?: { ephemeral?: boolean },
) {
	const reply = { content: message, ...options };

	if (interaction.channel instanceof TextChannel && split) {
		return await interaction.channel.send(reply);
	}

	if (interaction instanceof CommandInteraction && interaction.deferred) {
		return await interaction.followUp(reply);
	}

	return await interaction.reply(reply);
}

function splitMessage(message: string, CHARACTER_LIMIT: number) {
	const chunks = [];
	let m = message;

	while (m.length > CHARACTER_LIMIT) {
		let lastLineBreakIndex = m.lastIndexOf("\n", CHARACTER_LIMIT - 1);
		if (lastLineBreakIndex === -1) {
			lastLineBreakIndex = CHARACTER_LIMIT;
		}

		chunks.push(m.substring(0, lastLineBreakIndex));
		m = m.substring(lastLineBreakIndex).trim();
	}

	// Add the remaining part of the message
	chunks.push(m);

	return chunks;
}
