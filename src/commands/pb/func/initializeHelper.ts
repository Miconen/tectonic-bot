import { Requests } from "@requests/main.js";
import type { CategoryUpdate } from "@typings/requests.js";
import { formatGuildTimesForEmbeds } from "@utils/guilds.js";
import { getString } from "@utils/stringRepo.js";
import type { CommandInteraction, TextChannel } from "discord.js";
import removeOldEmbeds from "./removeOldEmbeds.js";
import buildCategoryEmbed, { buildBossFields, getMembersFromTeams } from "./embedHelpers.js";

async function initializeHelper(interaction: CommandInteraction) {
	if (!interaction.guild) {
		await interaction.reply({
			content: getString("errors", "noGuild"),
			ephemeral: true,
		});
		return;
	}
	await interaction.deferReply({ ephemeral: true });
	await interaction.editReply({
		content: getString("times", "fetchingGuildData"),
	});

	const res = await Requests.getGuildTimes(interaction.guild.id);
	if (res.error) {
		await interaction.deleteReply();
		await interaction.followUp({
			content: getString("errors", "apiError", {
				activity: "fetching guild times",
				error: res.message,
			}),
			ephemeral: true,
		});
		return;
	}

	await interaction.editReply({
		content: getString("times", "removingOldEmbeds"),
	});
	await removeOldEmbeds(res.data, interaction.client);

	await interaction.editReply({
		content: getString("times", "creatingEmbeds"),
	});

	// Create combined categories data
	const categories = formatGuildTimesForEmbeds(res.data)
	const members = await getMembersFromTeams(interaction.guild, res.data.teammates)
	const channel = interaction.channel as TextChannel;

	const msgs: CategoryUpdate[] = [];
	for (const category of categories) {
		const embed = buildCategoryEmbed(category).addFields(
			buildBossFields(category.bosses, members)
		);

		const { id } = await channel.send({ embeds: [embed] });
		msgs.push({ message_id: id, category: category.name });
	}

	await interaction.editReply({ content: "Storing data..." });
	const update = await Requests.updateGuild(interaction.guild.id, {
		pb_channel: interaction.channelId,
		category_messages: msgs,
	});

	await interaction.deleteReply();
	if (update.error) {
		await interaction.followUp({
			content: getString("errors", "internalError"),
		});
		return;
	}

	await interaction.followUp({
		content: getString("times", "finished"),
		ephemeral: true,
	});
}

export default initializeHelper;
