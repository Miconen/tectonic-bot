import { getLogger } from "@logging/context";
import type {
	ButtonInteraction,
	InteractionEditReplyOptions,
	InteractionReplyOptions,
	MessageCreateOptions,
} from "discord.js";
import { CommandInteraction, DiscordAPIError, TextChannel } from "discord.js";

type ReplyOptions = Pick<InteractionReplyOptions, "flags">;

export async function replyHandler(
	message: string,
	interaction: CommandInteraction | ButtonInteraction,
	options?: ReplyOptions,
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
	options?: ReplyOptions,
) {
	try {
		if (interaction.channel instanceof TextChannel && split) {
			const payload: MessageCreateOptions = { content: message };
			return await interaction.channel.send(payload);
		}

		if (interaction.deferred && !interaction.replied) {
			const payload: InteractionEditReplyOptions = {
				content: message,
			};
			return await interaction.editReply(payload);
		}

		const payload: InteractionReplyOptions = {
			content: message,
			...options,
		};

		if (interaction.replied) {
			return await interaction.followUp(payload);
		}

		return await interaction.reply(payload);
	} catch (error) {
		// Ignore expired interaction token (10062: Unknown interaction)
		if (error instanceof DiscordAPIError && error.code === 10062) {
			getLogger().warn(
				{ interactionId: interaction.id },
				"Interaction expired before reply could be sent (10062)",
			);
			return;
		}

		// Re-throw unexpected errors
		throw error;
	}
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
