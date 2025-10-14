import { Requests } from "@requests/main";
import { invalidateEventCache } from "@utils/events";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import type { CommandInteraction } from "discord.js";

export async function eventRemoveHelper(
	event: string,
	interaction: CommandInteraction,
) {
	if (!interaction.guild) {
		await replyHandler(getString("errors", "noGuild"), interaction, {
			ephemeral: true,
		});
		return;
	}

	const response = await Requests.deleteEvent(interaction.guild.id, event)
	if (!response || response.error) {
		await replyHandler(getString("errors", "noEvents"), interaction, {
			ephemeral: true,
		});
		return;
	}

	invalidateEventCache(interaction.guild.id)
	return replyHandler(getString("competitions", "eventDeleted", { field: event }), interaction, { ephemeral: true });
}
