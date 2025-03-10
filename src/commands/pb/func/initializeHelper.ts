import { Requests } from "@requests/main.js"
import { CategoryUpdate } from "@typings/requests.js"
import { notEmpty } from "@utils/notEmpty.js"
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
    //let member = interaction.member as GuildMember

    await interaction.deferReply({ ephemeral: true })

    await interaction.editReply({ content: "Fetching guild data..." })
    const res = await Requests.getGuildTimes(guildId)

    if (res.error) {
        await interaction.reply({ content: getString("errors", "guildTimes", { error: res.message }), ephemeral: true });
        return;
    }

    await interaction.editReply({ content: "Removing old category embeds..." })
    //await removeOldEmbeds(guildId, interaction.client)

    await interaction.editReply({ content: "Creating embeds..." })

    // Create combined bosses data
    const bosses = res.data.guild_bosses.map(gb => {
        let pb = res.data.pbs.find(t => t.run_id === gb.pb_id)
        let teammates = res.data.teammates.filter(tm => tm.run_id === gb.pb_id)

        // Find all guild_bosses entries for this boss
        const boss = res.data.bosses.find(b => b.name === gb.boss);

        if (!boss) return

        // Return combined data
        return { ...gb, ...boss, pb, teammates };
    }).filter(notEmpty);

    // Create combined categories data
    const categories = res.data.guild_categories.map(gc => {
        let bs = bosses.filter(b => b.category === gc.category)

        // Find all guild_categories entries for this category
        const category = res.data.categories.find(c => gc.category === c.name);

        if (!category) return

        // Return combined data
        return { ...gc, ...category, bosses: bs };
    }).filter(notEmpty).sort((a, b) => a.order - b.order);

    const players = new Set<string>(res.data.teammates.map(t => t.user_id))
    const members = await interaction.guild.members.fetch({ user: Array.from(players) })
    const msgs: CategoryUpdate[] = []

    for (let category of categories) {
        let embed = embedBuilder(interaction)
            .setTitle(category.name)
            .setThumbnail(category.thumbnail)

        let fields: TimeField[] = []

        for (let boss of category.bosses) {
            let formattedTime = "No time yet"
            if (boss.pb) {
                formattedTime = TimeConverter.ticksToTime(boss.pb.time)
            }

            let formattedTeam = ""
            const team = boss.teammates.map(
                (player) => `**${members.get(player.user_id)?.displayName}**`
            )
            if (team) {
                formattedTeam = `${team?.join(", ")}`
            }

            fields.push({
                name: boss.display_name,
                value: `${formattedTime} ${formattedTeam}`,
            })
        }

        embed.addFields(...fields)

        let { id } = await channel.send({ embeds: [embed] })
        msgs.push({ message_id: id, category: category.category })
    }

    await interaction.editReply({ content: "Storing data..." })
    await Requests.updateGuild(guildId, { pb_channel: interaction.channelId, category_messages: msgs })
    await interaction.editReply({ content: "Finished" })
}

export default initializeHelper
