import { CommandInteraction, TextChannel } from "discord.js";
import prisma from "../../../database/client.js";
import embedBuilder from "./embedBuilder.js";
import removeOldEmbeds from "./removeOldEmbeds.js";
import { GuildBoss, GuildCategory, TimeField } from "./types.js";

async function initializeHelper(interaction: CommandInteraction) {
    // Guild id should always be set, if not let the program fail for easier debugging
    const guildId = interaction.guildId!;

    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply({ content: "Removing old category embeds..." })

    await removeOldEmbeds(guildId, interaction.client);

    await interaction.editReply({ content: "Getting categories and bosses..." })

    const categoriesWithBosses = await prisma.categories.findMany({
        include: {
            bosses: true,
        },
    });

    // Accessing categories with associated bosses
    const categories = categoriesWithBosses.map((category) => {
        const { bosses, ...categoryData } = category;
        return {
            ...categoryData,
            bosses,
        };
    });

    let channel = interaction.channel as TextChannel;

    await interaction.editReply({ content: "Creating embeds..." })

    const guildBosses: GuildBoss[] = [];
    const guildCategories: GuildCategory[] = [];

    // Fetch existing boss data from guild_bosses table in a single query
    const existingBosses = await prisma.guild_bosses.findMany({
        where: {
            guild_id: guildId,
        },
        include: {
            times: {
                include: {
                    teams: true,
                }
            },
        }
    });

    const existingBossesMap = new Map(existingBosses.map((boss) => [boss.boss, boss]));

    for (let category of categories) {
        let embed = embedBuilder(interaction)
            .setTitle(category.name)
            .setThumbnail(category.thumbnail);

        let fields: TimeField[] = [];

        for (let boss of category.bosses) {
            const existingBoss = existingBossesMap.get(boss.name);
            const time = existingBoss?.times?.time.toString() || "No time yet";
            const team = existingBoss?.times?.teams.map(player => `<@${player.user_id}>`);

            fields.push({ name: boss.display_name, value: time + " " + team?.join(", ") ?? "" });

            guildBosses.push({
                boss: boss.name,
                guild_id: guildId,
            });
        }

        embed.addFields(...fields);

        let { id: messageId } = await channel.send({ embeds: [embed] });

        guildCategories.push({
            guild_id: guildId,
            category: category.name,
            message_id: messageId,
        });
    }

    await interaction.editReply({ content: "Storing data..." })

    await prisma.guilds.upsert({
        where: {
            guild_id: guildId,
        },
        update: {
            pb_channel_id: interaction.channelId,
        },
        create: {
            guild_id: guildId,
            multiplier: 1,
            pb_channel_id: interaction.channelId,
        }
    })

    await prisma.guild_bosses.createMany({
        data: guildBosses,
        skipDuplicates: true,
    });

    await prisma.guild_categories.deleteMany({
        where: {
            guild_id: guildId,
        }
    });

    await prisma.guild_categories.createMany({
        data: guildCategories,
        skipDuplicates: true,
    });

    await interaction.editReply({ content: "Finished" })
}

export default initializeHelper;
