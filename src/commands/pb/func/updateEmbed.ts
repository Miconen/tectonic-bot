import { CommandInteraction, TextChannel } from "discord.js"
import prisma from "../../../database/client.js"
import embedBuilder from "./embedBuilder.js"
import ticksToTime from "./ticksToTime.js"
import TimeConverter from "./TimeConverter.js"
import { TimeField } from "./types.js"

async function updateEmbed(
    bossId: string,
    guildId: string,
    interaction: CommandInteraction
) {
    const boss = await prisma.bosses.findUnique({
        where: { name: bossId },
    })

    if (!boss) return

    const bosses = await prisma.bosses.findMany({
        where: { category: boss.category },
        include: {
            guild_bosses: {
                include: {
                    times: {
                        include: {
                            teams: true,
                        },
                    },
                },
            },
        },
    })

    const category = await prisma.guild_categories.findUnique({
        where: {
            guild_id_category: { guild_id: guildId, category: boss.category },
        },
        include: {
            guilds: true,
            categories: true,
        },
    })

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
        let formattedTime = "No time yet";
        const time = guildBoss?.times?.time
        if (time) {
            formattedTime = TimeConverter.ticksToTime(time)
        }
        const team = guildBoss?.times?.teams.map(
            (player) => `<@${player.user_id}>`
        )

        fields.push({
            name: bossData.display_name,
            value: formattedTime + " " + team?.join(", ") ?? "",
        })
    }

    embed.addFields(...fields)

    await message.edit({ embeds: [embed] })
}

export default updateEmbed
