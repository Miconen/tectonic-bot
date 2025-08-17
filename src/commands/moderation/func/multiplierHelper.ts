import type { CommandInteraction } from "discord.js";
import { Requests } from "@requests/main.js";
import { getString } from "@utils/stringRepo";
import { replyHandler } from "@utils/replyHandler";

const multiplierHelper = async (
	multiplier: number,
	interaction: CommandInteraction,
) => {
	if (!interaction.guild) {
		await replyHandler(getString("errors", "noGuild"), interaction, {
			ephemeral: true,
		});
		return;
	}

	const res = await Requests.updateGuild(interaction.guild.id, {
		multiplier,
	});

	if (res.error) {
		await replyHandler(getString("errors", "internalError"), interaction, {
			ephemeral: true,
		});
		return;
	}

	await replyHandler(
		getString("moderation", "multiplierSet", { multiplier }),
		interaction,
	);
};

export default multiplierHelper;
