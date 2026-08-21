import type {
	CommandInteraction,
	ButtonInteraction,
	InteractionDeferReplyOptions,
} from "discord.js";

export async function safeDefer(
	interaction: CommandInteraction | ButtonInteraction,
	options?: InteractionDeferReplyOptions,
) {
	if (!interaction.deferred && !interaction.replied) {
		await interaction.deferReply(options);
	}
}
