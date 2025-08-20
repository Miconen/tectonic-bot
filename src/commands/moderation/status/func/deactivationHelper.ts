import type { CommandInteraction, GuildMember } from "discord.js";
import type IRankService from "@utils/rankUtils/IRankService";
import { Requests } from "@requests/main.js";

import { container } from "tsyringe";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";

const deactivationHelper = async (
	user: GuildMember,
	interaction: CommandInteraction,
) => {
	if (!interaction.guild) return;
	const rankService = container.resolve<IRankService>("RankService");
	await interaction.deferReply();

	const result = await Requests.removeUser(interaction.guild.id, {
		type: "user_id",
		user_id: user.user.id,
	});

	if (result.status === 404) {
		return await replyHandler(
			getString("errors", "notActivated", {
				username: user.displayName,
			}),
			interaction,
		);
	}

	if (result.error) {
		return await replyHandler(
			getString("errors", "internalError", {
				username: user.displayName,
			}),
			interaction,
		);
	}

	// Remove all rank roles
	await rankService.removeOldRoles(user);
	return await replyHandler(
		getString("accounts", "deactivated", { username: user.displayName }),
		interaction,
	);
};

export default deactivationHelper;
