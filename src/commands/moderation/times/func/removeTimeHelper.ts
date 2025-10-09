import updateEmbed from "@commands/pb/func/updateEmbed";
import { Requests } from "@requests/main";
import { invalidateGuildCache } from "@utils/guildTimes";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import type { CommandInteraction } from "discord.js";

export async function revertTimeHelper(
	boss: string,
	interaction: CommandInteraction,
) {
	if (!interaction.guild) {
		return await replyHandler(getString("errors", "noGuild"), interaction, {
			ephemeral: true,
		});
	}

	const res = await Requests.removeGuildTime(interaction.guild.id, boss);
	if (res.error && res.code === 1008) {
		return await replyHandler(getString("times", "timeNotFound"), interaction, {
			ephemeral: true,
		});
	}

	if (res.error) {
		return await replyHandler(
			getString("errors", "internalError"),
			interaction,
			{ ephemeral: true },
		);
	}

	invalidateGuildCache(interaction.guild.id);

	await replyHandler(
		getString("moderation", "timeRollback", { boss }),
		interaction,
		{ ephemeral: true },
	);

	const success = await updateEmbed(boss, interaction);
	if (!success) {
		await replyHandler(
			getString("times", "failedUpdatingEmbed"),
			interaction,
			{ ephemeral: true },
		);
	}
}
