import { getString } from "@utils/stringRepo";
import type { CommandInteraction } from "discord.js";
import type { GuardFunction } from "discordx";
import { checkHealth } from "health/healthcheck";

export const IsHealthy: GuardFunction<CommandInteraction> = async (
	interaction,
	_,
	next,
) => {
	const healthy = await checkHealth();

	if (!healthy) {
		return await interaction.reply({
			content: getString("errors", "apiHealth"),
			ephemeral: true,
		});
	}

	return await next();
};
