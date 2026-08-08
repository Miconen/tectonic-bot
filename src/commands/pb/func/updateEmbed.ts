import { Requests } from "@requests/main.js";
import { formatGuildTimesForEmbeds } from "@utils/guilds.js";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import {
	MessageFlags,
	type ButtonInteraction,
	type CommandInteraction,
	type TextChannel,
} from "discord.js";
import buildCategoryEmbed, {
	buildBossFields,
	findCategoryByBoss,
	getMembersFromTeams,
} from "./embedHelpers.js";
import { replyApiError } from "@utils/replyApiError.js";

async function updateEmbed(
	boss: string,
	interaction: CommandInteraction<"cached"> | ButtonInteraction<"cached">,
) {
	const res = await Requests.getGuildTimes(interaction.guild.id);
	if (res.error) {
		await replyApiError(res, interaction, {
			category: "recordErrors",
		});
		return false;
	}

	const category = findCategoryByBoss(
		formatGuildTimesForEmbeds(res.data),
		boss,
	);
	if (!category?.message_id || !res.data.pb_channel_id) {
		await replyHandler(getString("times", "failedUpdatingEmbed"), interaction, {
			flags: MessageFlags.Ephemeral,
		});
		return false;
	}

	try {
		const channel = (await interaction.client.channels.fetch(
			res.data.pb_channel_id,
		)) as TextChannel;
		if (!channel) {
			await replyHandler(
				getString("times", "failedUpdatingEmbed"),
				interaction,
				{
					flags: MessageFlags.Ephemeral,
				},
			);
			return false;
		}

		const message = await channel.messages.fetch(category.message_id);
		if (!message) {
			await replyHandler(
				getString("times", "failedUpdatingEmbed"),
				interaction,
				{
					flags: MessageFlags.Ephemeral,
				},
			);
			return false;
		}

		const members = await getMembersFromTeams(
			interaction.guild,
			res.data.teammates,
		);

		const embed = buildCategoryEmbed(category).addFields(
			buildBossFields(category.bosses, members),
		);

		await message.edit({ embeds: [embed] });
	} catch (error) {
		await replyHandler(
			getString("errors", "somethingUnexpected"),
			interaction,
			{ flags: MessageFlags.Ephemeral },
		);
		return false;
	}

	return true;
}

export default updateEmbed;
