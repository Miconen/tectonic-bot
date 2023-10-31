import { CommandInteraction, TextChannel } from "discord.js"
import embedBuilder from "./embedBuilder.js"
import TimeConverter from "./TimeConverter.js"
import { TimeField } from "./types.js"
import type IDatabase from "../../../database/IDatabase"

import { container } from "tsyringe"

async function updateEmbed(
    bossId: string,
    guildId: string,
    interaction: CommandInteraction
) {
    const database = container.resolve<IDatabase>("Database")

    const boss = await database.getBoss(bossId)
    if (!boss) return

    const bosses = await database.getCategoryByBoss(boss.category)
    const category = await database.getEmbedData(guildId, boss.category)
    if (!bosses || !category) return
    if (!category.guilds.pb_channel_id) return

    let channel = (await interaction.client.channels.fetch(
        category.guilds.pb_channel_id
    )) as TextChannel
    if (!channel) return
    let message = await channel.messages.fetch(category.message_id)
    if (!message) return

    let embed = embedBuilder(interaction)
        .setTitle(boss.category)
        .setThumbnail(category.categories.thumbnail)

    let fields: TimeField[] = []

    for (let bossData of bosses) {
        let guildBoss = bossData.guild_bosses[0]
        let formattedTime = "No time yet"
        const time = guildBoss?.times?.time
        if (time) {
            formattedTime = TimeConverter.ticksToTime(time)
        }

        let formattedTeam = ""
        const team = guildBoss?.times?.teams.map(
            (player) => `<@${player.user_id}>`
        )
        if (team) {
            formattedTeam = team?.join(", ");
        }

        fields.push({
            name: bossData.display_name,
            value: `${formattedTime} ${formattedTeam}`,
        })
    }

    embed.addFields(...fields)

    await message.edit({ embeds: [embed] })
}

export default updateEmbed
