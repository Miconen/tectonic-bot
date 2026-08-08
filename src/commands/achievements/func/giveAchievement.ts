import { Requests } from "@requests/main";
import type { AchievementParam } from "@typings/api/achievement";
import { invalidateUserCache } from "@utils/pickers";
import { replyApiError } from "@utils/replyApiError";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import type { CommandInteraction, GuildMember } from "discord.js";

export const giveAchievementHelper = async (
	user: GuildMember,
	interaction: CommandInteraction<"cached">,
	achievement: string,
) => {
	const params: AchievementParam = {
		achievement,
		guild_id: interaction.guild.id,
		type: "user_id",
		user_id: user.id,
	};
	const res = await Requests.giveAchievement(params);

	if (res.error) {
		return await replyApiError(res, interaction, {
			category: "achievementErrors",
			args: {
				achievement,
				username: user.displayName,
			},
		});
	}

	invalidateUserCache(interaction.guild.id, user.id);

	return await replyHandler(
		getString("achievements", "granted", {
			achievement,
			username: user.displayName,
		}),
		interaction,
	);
};
