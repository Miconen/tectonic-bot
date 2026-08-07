import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import { MessageFlags, type CommandInteraction } from "discord.js";
import type { GuardFunction } from "discordx";
import { checkHealth } from "health/healthcheck";

export const IsHealthy: GuardFunction<CommandInteraction<"cached">> = async (
	interaction,
	_,
	next,
) => {
	const healthy = await checkHealth();

	if (!healthy) {
		return await replyHandler(getString("errors", "apiHealth"), interaction, {
			flags: MessageFlags.Ephemeral,
		});
	}

	return await next();
};
