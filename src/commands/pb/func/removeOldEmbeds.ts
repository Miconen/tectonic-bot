import { Client, TextChannel } from "discord.js";
import prisma from "../../../database/client.js";

async function removeOldEmbeds(guildId: string, client: Client) {
    const fetchCategoriesPromise = prisma.guild_categories.findMany({
        where: {
            guild_id: guildId,
        },
    });

    const fetchGuildPromise = prisma.guilds.findUnique({
        where: {
            guild_id: guildId,
        },
    });

    const [categories, guild] = await Promise.all([fetchCategoriesPromise, fetchGuildPromise]);

    if (categories.length == 0) return;
    if (!guild) return;

    const channelId = guild.pb_channel_id;
    if (!channelId) return;

    const channel = await client.channels.fetch(channelId) as TextChannel;
    if (!channel) return;

    const messageIds = categories.map(category => category.message_id);
    await channel.bulkDelete(messageIds);
}

export default removeOldEmbeds;
