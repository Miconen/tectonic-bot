import type { CommandInteraction, ButtonInteraction } from "discord.js";

export async function safeDefer(
	interaction: CommandInteraction | ButtonInteraction,
) {
	if (!interaction.deferred && !interaction.replied) {
		await interaction.deferReply();
	}
}
