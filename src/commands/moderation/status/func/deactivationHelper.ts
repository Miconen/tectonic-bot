import { Requests } from "@requests/main.js";
import type IRankService from "@utils/rankUtils/IRankService";
import type { CommandInteraction, GuildMember } from "discord.js";

import { getLogger } from "@logging/context";
import { dumpUserData } from "@utils/dumpUserData";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import { container } from "tsyringe";
import { replyApiError } from "@utils/replyApiError";

const deactivationHelper = async (
	user: GuildMember,
	interaction: CommandInteraction<"cached">,
) => {
	const logger = getLogger();
	const rankService = container.resolve<IRankService>("RankService");

	// Fetch BEFORE removal (removeUser purges the user's records/times)
	const res = await Requests.getUser(interaction.guild.id, {
		type: "user_id",
		user_id: user.id,
	});

	if (!res.error && res.data) {
		try {
			await dumpUserData(
				interaction.client,
				interaction.guild.id,
				user.id,
				res.data,
				"Deactivation",
			);
		} catch (e) {
			logger.warn(
				{ err: e, userId: user.id, guildId: interaction.guild.id },
				"Failed to dump deactivated user's data",
			);
		}
	}

	const result = await Requests.removeUser(interaction.guild.id, {
		type: "user_id",
		user_id: user.user.id,
	});

	if (result.error) {
		return await replyApiError(result, interaction, {
			category: "accountErrors",
			args: {
				username: user.displayName,
			},
		});
	}

	// Remove all rank roles
	await rankService.removeOldRoles(user);
	return await replyHandler(
		getString("accounts", "deactivated", { username: user.displayName }),
		interaction,
	);
};

export default deactivationHelper;
