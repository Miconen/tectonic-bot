import { Requests } from "@requests/main";
import type IRankService from "@utils/rankUtils/IRankService";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo";
import {
	MessageFlags,
	type CommandInteraction,
	type GuildMember,
} from "discord.js";
import { container } from "tsyringe";

const activationHelper = async (
	user: GuildMember,
	rsn: string,
	interaction: CommandInteraction<"cached">,
) => {
	const rankService = container.resolve<IRankService>("RankService");
	await interaction.deferReply();

	const result = await Requests.createUser(
		interaction.guild.id,
		user.user.id,
		rsn,
	);

	if (result.status === 404 && result.error) {
		// TODO: These error codes come from the API, store them in one place and use here
		if (result.code === 1000) {
			return await replyHandler(
				getString("errors", "guildNotInitialized"),
				interaction,
				{ flags: MessageFlags.Ephemeral },
			);
		}
		return await replyHandler(
			getString("errors", "errorFetchingWom"),
			interaction,
			{ flags: MessageFlags.Ephemeral },
		);
	}

	if (result.status === 409 && result.error) {
		return await replyHandler(
			getString("accounts", "alreadyActivated", { username: user.displayName }),
			interaction,
			{ flags: MessageFlags.Ephemeral },
		);
	}

	if (result.error) {
		return await replyHandler(
			getString("errors", "internalError"),
			interaction,
			{ flags: MessageFlags.Ephemeral },
		);
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
