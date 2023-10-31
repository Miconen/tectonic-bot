import { Client, TextChannel } from "discord.js"
import type IDatabase from "../../../database/IDatabase"

import { container } from "tsyringe"

async function removeOldEmbeds(guildId: string, client: Client) {
    const database = container.resolve<IDatabase>("Database")

    const categoriesPromise = database.getGuildCategories(guildId)
    const guildPromise = database.getGuild(guildId)

    const [categories, guild] = await Promise.all([
        categoriesPromise,
        guildPromise,
    ])

    if (categories.length == 0) return
    if (!guild) return

    const channelId = guild.pb_channel_id
    if (!channelId) return

    // Try to fetch old messages
    try {
        const channel = (await client.channels.fetch(channelId)) as TextChannel
        if (!channel) return

        const messageIds = categories.map((category) => category.message_id)

        await channel.bulkDelete(messageIds)
    } catch {
        console.log("Couldn't bulk delete old embeds")
    }
}

export default removeOldEmbeds
