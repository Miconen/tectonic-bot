import { Requests } from "@requests/main.js";
import { Multipliers } from "@utils/pointSources";
import { replyApiError } from "@utils/replyApiError";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import type { CommandInteraction } from "discord.js";

const multiplierHelper = async (
	multiplier: number,
	interaction: CommandInteraction<"cached">,
) => {
	const res = await Requests.updateGuild(interaction.guild.id, {
		multiplier,
	});

	if (res.error) {
		return await replyApiError(res, interaction);
	}

	// Update multiplier cache
	Multipliers.set(interaction.guild.id, multiplier);

	await replyHandler(
		getString("moderation", "multiplierSet", { multiplier }),
		interaction,
	);
};

export default multiplierHelper;
