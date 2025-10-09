import { Requests } from "@requests/main.js";
import { formatGuildTimesForEmbeds } from "@utils/guilds.js";
import { getString } from "@utils/stringRepo.js";
import type { CommandInteraction, TextChannel } from "discord.js";
import buildCategoryEmbed, { buildBossFields, findCategoryByBoss, getMembersFromTeams } from "./embedHelpers.js";
import { replyHandler } from "@utils/replyHandler.js";

async function updateEmbed(
	boss: string,
	interaction: CommandInteraction,
) {
	if (!interaction.guild) {
		await interaction.reply({
			content: getString("errors", "noGuild"),
			ephemeral: true,
		});
		return false;
	}

	const res = await Requests.getGuildTimes(interaction.guild.id);

	if (res.error) {
		await interaction.deleteReply();
		await interaction.followUp({
			content: getString("errors", "apiError", {
				activity: "fetching data for pb embeds",
				error: res.message,
			}),
			ephemeral: true,
		});
		return false;
	}

	const category = findCategoryByBoss(formatGuildTimesForEmbeds(res.data), boss)
	if (!category?.message_id || !res.data.pb_channel_id) return false

	try {
		const channel = (await interaction.client.channels.fetch(
			res.data.pb_channel_id,
		)) as TextChannel;
		if (!channel) return false;

		const message = await channel.messages.fetch(category.message_id);
		if (!message) return false;

		const members = await getMembersFromTeams(interaction.guild, res.data.teammates)

		const embed = buildCategoryEmbed(category).addFields(
			buildBossFields(category.bosses, members)
		);

		await message.edit({ embeds: [embed] });
	} catch (error) {
		await replyHandler(
			getString("errors", "somethingUnexpected"),
			interaction,
			{ ephemeral: true },
		);
		return false
	}

	return true
}

export default updateEmbed;
