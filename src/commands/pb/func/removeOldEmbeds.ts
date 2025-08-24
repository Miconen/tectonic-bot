import type { DetailedGuild } from "@typings/requests";
import { notEmpty } from "@utils/notEmpty";
import type { Client, TextChannel } from "discord.js";

async function removeOldEmbeds(guild: DetailedGuild, client: Client) {
	if (!guild.pb_channel_id) return;

	// Try to fetch old messages
	try {
		const channel = (await client.channels.fetch(
			guild.pb_channel_id,
		)) as TextChannel;
		if (!channel) return;

		const embeds = guild.guild_categories.map((c) => c.message_id);

		await channel.bulkDelete(embeds.filter(notEmpty));
	} catch {
		console.log("Error bulk deleting old embeds");
	}
}

export default removeOldEmbeds;
