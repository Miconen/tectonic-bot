import { Requests } from "@requests/main";
import type { AchievementParam } from "@typings/requests";
import { invalidateUserCache } from "@utils/pickers";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import type { CommandInteraction, GuildMember } from "discord.js";

export const removeAchievementHelper = async (
	user: GuildMember,
	interaction: CommandInteraction,
	achievement: string,
) => {
	if (!interaction.guild)
		return await replyHandler(getString("errors", "noGuild"), interaction, {
			ephemeral: true,
		});

	const params: AchievementParam = {
		achievement,
		guild_id: interaction.guild.id,
		type: "user_id",
		user_id: user.id,
	};
	const res = await Requests.removeAchievement(params);

	// Specified achievement not found
	if (res.status === 404) {
		return await replyHandler(
			getString("achievements", "notFound", { achievement }),
			interaction,
		);
	}

	// Other error
	if (res.error) {
		return await replyHandler(
			getString("errors", "internalError"),
			interaction,
		);
	}

	invalidateUserCache(interaction.guild.id, user.id);

	return await replyHandler(
		getString("achievements", "removed", {
			achievement,
			username: user.displayName,
		}),
		interaction,
	);
};
