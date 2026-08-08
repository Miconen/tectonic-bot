import { Requests } from "@requests/main";
import { invalidateEventCache } from "@utils/events";
import { replyApiError } from "@utils/replyApiError";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import { MessageFlags, type CommandInteraction } from "discord.js";

export async function eventRemoveHelper(
	event: string,
	interaction: CommandInteraction<"cached">,
) {
	const res = await Requests.deleteEvent(interaction.guild.id, event);

	if (res.error) {
		return await replyApiError(res, interaction, {
			category: "eventErrors",
			args: {
				event,
			},
		});
	}

	invalidateEventCache(interaction.guild.id);
	return replyHandler(
		getString("competitions", "eventDeleted", { field: event }),
		interaction,
		{ flags: MessageFlags.Ephemeral },
	);
}
