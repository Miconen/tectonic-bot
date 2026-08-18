import { Requests } from "@requests/main";
import { getRanks } from "@ranks/guildRanks";
import { tierForPoints } from "@ranks/tierMath";
import { replyApiError } from "@utils/replyApiError";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo";
import type { CommandInteraction, GuildMember } from "discord.js";

const activationHelper = async (
	user: GuildMember,
	rsn: string,
	interaction: CommandInteraction<"cached">,
) => {
	const res = await Requests.createUser(
		interaction.guild.id,
		user.user.id,
		rsn,
	);

	if (res.error) {
		return await replyApiError(res, interaction, {
			category: "accountErrors",
			args: {
				rsn,
				username: user.displayName,
			},
		});
	}

	// Set default role
	const ranks = await getRanks(interaction.guild.id);
	const defaultTier = tierForPoints(0, ranks);

	if (defaultTier?.role_id) await user.roles.add(defaultTier.role_id);

	return await replyHandler(
		getString("accounts", "userActivatedByMember", {
			user,
			member: interaction.member,
		}),
		interaction,
	);
};

export default activationHelper;
