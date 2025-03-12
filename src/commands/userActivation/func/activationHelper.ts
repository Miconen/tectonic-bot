import type { CommandInteraction, GuildMember } from "discord.js";
import type IRankService from "@utils/rankUtils/IRankService";
import { replyHandler } from "@utils/replyHandler.js";
import { container } from "tsyringe";
import { Requests } from "@requests/main";
import { httpErrorHandler } from "@utils/httpErrorHandler";

const activationHelper = async (
	user: GuildMember,
	rsn: string,
	interaction: CommandInteraction,
) => {
	if (!interaction.guild) return;
	const rankService = container.resolve<IRankService>("RankService");
	await interaction.deferReply();

	const result = await Requests.createUser(
		interaction.guild.id,
		user.user.id,
		rsn,
	);

	if (result.error) {
		let response = `Unexpected error occurred...\n${result.message}`;

		if (result.status === 400) {
			response = `Error fetching user from Wise Old Man, or the guild is not activated...\n${result.message}`;
		}

		if (result.status === 409) {
			response = `❌ **${user.displayName}** is already activated.`;
		}

		return await replyHandler(response, interaction);
	}

	if (result.status === 201) {
		const response = `**${user.user}** has been activated and linked by **${interaction.member}**.`;
		// Set default role
		await rankService.addRole(interaction, user, "jade");
		return await replyHandler(response, interaction);
	}

	const handler = httpErrorHandler(result.status);
	if (handler.error) {
		const response = handler.message;
		return await replyHandler(response, interaction);
	}

	return await replyHandler("Something unexpected happened...", interaction);
};

export default activationHelper;
