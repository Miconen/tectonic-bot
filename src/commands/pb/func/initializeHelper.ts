import { CommandInteraction, TextChannel } from "discord.js"
import embedBuilder from "./embedBuilder.js"
import removeOldEmbeds from "./removeOldEmbeds.js"
import TimeConverter from "./TimeConverter.js"
import { GuildBoss, GuildCategory, TimeField } from "./types.js"

import { container } from "tsyringe"

async function initializeHelper(interaction: CommandInteraction) {
    const database = container.resolve<IDatabase>("Database")

    // Guild id should always be set, if not let the program fail for easier debugging
    const guildId = interaction.guildId!

    await interaction.deferReply({ ephemeral: true })
    await interaction.editReply({ content: "Removing old category embeds..." })

    await removeOldEmbeds(guildId, interaction.client)

    await interaction.editReply({ content: "Getting categories and bosses..." })

    const categoriesWithBosses = await database.getCategoriesWithBosses()
    // Accessing categories with associated bosses
    const categories = categoriesWithBosses.map((category) => {
        const { bosses, ...categoryData } = category
        return {
            ...categoryData,
            bosses,
        }
    })

    let channel = interaction.channel as TextChannel

    await interaction.editReply({ content: "Creating embeds..." })

    const guildBosses: GuildBoss[] = []
    const guildCategories: GuildCategory[] = []

    // Fetch existing boss data from guild_bosses table in a single query
    const existingBosses = await database.getGuildBossesPbs(guildId)
    const existingBossesMap = new Map(
        existingBosses.map((boss) => [boss.boss, boss])
    )

    // Sort categories by category order
    const sortedCategories = categories.sort((a, b) => a.order - b.order)

    for (let category of sortedCategories) {
        let embed = embedBuilder(interaction)
            .setTitle(category.name)
            .setThumbnail(category.thumbnail)

        let fields: TimeField[] = []

        for (let boss of category.bosses) {
            const existingBoss = existingBossesMap.get(boss.name)
            let formattedTime = "No time yet"
            const time = existingBoss?.times?.time
            if (time) {
                formattedTime = TimeConverter.ticksToTime(time)
            }

            let formattedTeam = ""
            const team = existingBoss?.times?.teams.map(
                (player) => `<@${player.user_id}>`
            )
            if (team) {
                formattedTeam = team?.join(", ")
            }

            fields.push({
                name: boss.display_name,
                value: `${formattedTime} ${formattedTeam}`,
            })

            guildBosses.push({
                boss: boss.name,
                guild_id: guildId,
            })
        }

        embed.addFields(...fields)

        let { id: messageId } = await channel.send({ embeds: [embed] })

        guildCategories.push({
            guild_id: guildId,
            category: category.name,
            message_id: messageId,
        })
    }

    await interaction.editReply({ content: "Storing data..." })
    await database.updatePbChannel(guildId, interaction.channelId)
    await database.ensureGuildBossesExist(guildBosses)
    await database.updateGuildCategories(guildId, guildCategories)
    await interaction.editReply({ content: "Finished" })
}

export default initializeHelper
