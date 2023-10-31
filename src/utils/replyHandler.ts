import type { CommandInteraction } from "discord.js"

/**
 * Handles the reply to a Discord interaction, deferring or replying based on context, as you cannot reply to deferred commands.
 */
export async function replyHandler(message: string, interaction: CommandInteraction) {
    if (interaction.deferred) {
        return await interaction.followUp(message);
    }

    return await interaction.reply(message);
}
