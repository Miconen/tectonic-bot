import { Requests } from "@requests/main";
import type { AchievementParam } from "@typings/requests";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import type { CommandInteraction, GuildMember } from "discord.js";

export const giveAchievementHelper = async (
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
	const res = await Requests.giveAchievement(params);

	// Specified achievement not found
	if (res.status === 404) {
		return await replyHandler(
			getString("achievements", "notFound", { achievement }),
			interaction,
		);
	}

	// Conflict, user already has achievement
	if (res.status === 409) {
		return await replyHandler(
			getString("achievements", "alreadyHas", {
				username: user.displayName,
				achievement,
			}),
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

	return await replyHandler(
		getString("achievements", "granted", {
			achievement,
			username: user.displayName,
		}),
		interaction,
	);
};
