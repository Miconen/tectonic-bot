import { Requests } from "@requests/main.js";
import { formatGuildTimes } from "@utils/guilds.js";
import { getString } from "@utils/stringRepo.js";
import type { CommandInteraction, TextChannel } from "discord.js";
import embedBuilder from "./embedBuilder.js";
import TimeConverter from "./TimeConverter.js";
import type { TimeField } from "./types.js";

async function updateEmbed(
	bossId: string,
	guildId: string,
	interaction: CommandInteraction,
) {
	const res = await Requests.getGuildTimes(guildId);

	if (res.error) {
		await interaction.deleteReply();
		await interaction.followUp({
			content: getString("errors", "apiError", {
				activity: "fetching data for pb embeds",
				error: res.message,
			}),
			ephemeral: true,
		});
		return;
	}

	const category = formatGuildTimes(res.data).find((c) => {
		return c.bosses.some((b) => b.boss === bossId);
	});
	if (!category || !category.message_id) return;

	if (!res.data.pb_channel_id) return;
	const channel = (await interaction.client.channels.fetch(
		res.data.pb_channel_id,
	)) as TextChannel;
	if (!channel) return;
	const message = await channel.messages.fetch(category.message_id);
	if (!message) return;

	const embed = embedBuilder(interaction)
		.setTitle(category.name)
		.setThumbnail(category.thumbnail);

	const fields: TimeField[] = [];

	for (const boss of category.bosses) {
		let time = "No time yet";
		if (boss.pb) {
			time = TimeConverter.ticksToTime(boss.pb.time);
		}

		const team =
			boss.teammates?.map((player) => `<@${player.user_id}>`).join(", ") ?? "";

		fields.push({
			name: boss.display_name,
			value: `${time} ${team}`,
		});
	}

	embed.addFields(fields);

	await message.edit({ embeds: [embed] });
}

export default updateEmbed;
