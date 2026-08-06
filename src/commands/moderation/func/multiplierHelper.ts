import { Requests } from "@requests/main.js";
import { Multipliers } from "@utils/pointSources";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import { MessageFlags, type CommandInteraction } from "discord.js";

const multiplierHelper = async (
	multiplier: number,
	interaction: CommandInteraction<"cached">,
) => {
	const res = await Requests.updateGuild(interaction.guild.id, {
		multiplier,
	});

	if (res.error) {
		await replyHandler(getString("errors", "internalError"), interaction, {
			flags: MessageFlags.Ephemeral,
		});
		return;
	}

	// Update multiplier cache
	Multipliers.set(interaction.guild.id, multiplier);

	await replyHandler(
		getString("moderation", "multiplierSet", { multiplier }),
		interaction,
	);
};

export default multiplierHelper;
