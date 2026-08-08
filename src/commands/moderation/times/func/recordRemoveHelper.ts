import { Requests } from "@requests/main";
import { invalidateGuildCache } from "@utils/guildTimes";
import { replyApiError } from "@utils/replyApiError";
import { replyHandler } from "@utils/replyHandler";
import { MessageFlags, type CommandInteraction } from "discord.js";

export async function recordRemoveHelper(
	recordIdStr: string,
	interaction: CommandInteraction<"cached">,
) {
	const res = await Requests.removeTimeById(interaction.guild.id, recordIdStr);
	if (res.error) {
		return await replyApiError(res, interaction, {
			category: "recordErrors",
			args: {
				activity: "removing record",
				error: res.message,
			},
		});
	}

	invalidateGuildCache(interaction.guild.id);

	await replyHandler(`Record \`#${recordIdStr}\` removed.`, interaction, {
		flags: MessageFlags.Ephemeral,
	});
}
