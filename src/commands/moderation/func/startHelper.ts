import { Requests } from "@requests/main";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import type { CommandInteraction } from "discord.js";

const startHelper = async (interaction: CommandInteraction) => {
	if (!interaction.guild)
		return await replyHandler(
			getString("errors", "guildNotInitialized"),
			interaction,
		);

	// Handle giving of points, returns a string to be sent as a message.
	const res = await Requests.createGuild(interaction.guild.id);
	if (res.error) return await interaction.reply(res.message);

	await replyHandler(getString("moderation", "guildInitialized"), interaction);
};

export default startHelper;
