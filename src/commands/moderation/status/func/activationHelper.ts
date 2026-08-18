import { Requests } from "@requests/main";
import type IRankService from "@utils/rankUtils/IRankService";
import { replyApiError } from "@utils/replyApiError";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo";
import type { CommandInteraction, GuildMember } from "discord.js";
import { container } from "tsyringe";

const activationHelper = async (
	user: GuildMember,
	rsn: string,
	interaction: CommandInteraction<"cached">,
) => {
	const rankService = container.resolve<IRankService>("RankService");

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
	await rankService.addRole(interaction, user, "jade");
	return await replyHandler(
		getString("accounts", "userActivatedByMember", {
			user,
			member: interaction.member,
		}),
		interaction,
	);
};

export default activationHelper;
