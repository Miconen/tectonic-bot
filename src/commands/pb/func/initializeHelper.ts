import { Requests } from "@requests/main.js"
import { CategoryUpdate } from "@typings/requests.js"
import { formatGuildTimes } from "@utils/guilds.js"
import { getString } from "@utils/stringRepo.js"
import { CommandInteraction, TextChannel } from "discord.js"
import embedBuilder from "./embedBuilder.js"
import removeOldEmbeds from "./removeOldEmbeds.js"
import TimeConverter from "./TimeConverter.js"
import { TimeField } from "./types.js"

async function initializeHelper(interaction: CommandInteraction) {
    if (!interaction.guild) {
        await interaction.reply({ content: getString("errors", "noGuild"), ephemeral: true });
        return;
    }
    const guildId = interaction.guild.id
    let channel = interaction.channel as TextChannel

    await interaction.deferReply({ ephemeral: true })

    await interaction.editReply({ content: "Fetching guild data..." })
    const res = await Requests.getGuildTimes(guildId)

    if (res.error) {
        await interaction.deleteReply();
        await interaction.followUp({ content: getString("errors", "apiError", { activity: "fetching guild times", error: res.message }), ephemeral: true });
        return;
    }

    await interaction.editReply({ content: "Removing old category embeds..." })
    await removeOldEmbeds(res.data, interaction.client)

    await interaction.editReply({ content: "Creating embeds..." })

    // Create combined categories data
    const categories = formatGuildTimes(res.data)
    const players = new Set<string>(res.data.teammates.map(t => t.user_id))
    const members = await interaction.guild.members.fetch({ user: Array.from(players) })
    const msgs: CategoryUpdate[] = []

    for (let category of categories) {
        let embed = embedBuilder(interaction)
            .setTitle(category.name)
            .setThumbnail(category.thumbnail)

        let fields: TimeField[] = []

        for (let boss of category.bosses) {
            let time = "No time yet"
            if (boss.pb) {
                time = TimeConverter.ticksToTime(boss.pb.time)
            }

            const team = boss.teammates.map(
                (player) => `**${members.get(player.user_id)?.displayName}**`
            ).join(", ")

            fields.push({
                name: boss.display_name,
                value: `${time} ${team}`,
            })
        }

        embed.addFields(fields)

        let { id } = await channel.send({ embeds: [embed] })
        msgs.push({ message_id: id, category: category.category })
    }

    await interaction.editReply({ content: "Storing data..." })
    const update = await Requests.updateGuild(guildId, { pb_channel: interaction.channelId, category_messages: msgs })

    await interaction.deleteReply();
    if (update.error) {
        await interaction.followUp({ content: "Error " })
        return
    }
    await interaction.followUp({ content: "Finished" })
}

export default initializeHelper
