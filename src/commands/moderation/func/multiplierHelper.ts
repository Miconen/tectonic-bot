import { CommandInteraction } from "discord.js";
import { Requests } from "@requests/main.js";
import { getString } from "@utils/stringRepo";

const multiplierHelper = async (
	multiplier: number,
	interaction: CommandInteraction,
) => {
	if (!interaction.guild) {
		await interaction.reply({
			content: getString("errors", "noGuild"),
			ephemeral: true,
		});
		return;
	}

	let newMultiplier = await Requests.updateGuild(interaction.guild.id, {
		multiplier,
	});

	let response = "Something went wrong...";

	if (newMultiplier) {
		response = `Updated server point multiplier to ${newMultiplier}`;
	}

	await interaction.reply(response);
};

export default multiplierHelper;
