import type { CommandInteraction } from "discord.js";

import { getString } from "@utils/stringRepo";
import { replyHandler } from "@utils/replyHandler";
import { getPoints } from "@utils/pointSources";

const splitHelp = async (interaction: CommandInteraction) => {
	if (!interaction.guild)
		return await interaction.reply(getString("errors", "noGuild"));

	await replyHandler(
		getString("splits", "helpText", {
			lowPoints: (await getPoints("split_low", interaction.guild.id)) ?? 0,
			mediumPoints:
				(await getPoints("split_medium", interaction.guild.id)) ?? 0,
			highPoints: (await getPoints("split_high", interaction.guild.id)) ?? 0,
		}),
		interaction,
	);
};

export default splitHelp;
