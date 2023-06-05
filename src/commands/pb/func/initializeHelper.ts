import { CommandInteraction, TextChannel } from "discord.js";
import prisma from "../../../database/client.js";
import { guildBossesByCategory } from "./getBosses.js";

type GuildBossData = {
    display_name: string,
    time: number | string,
}

async function initializeHelper(interaction: CommandInteraction) {
    const bosses = await prisma.bosses.findMany();
    const guildBossData = bosses.map((boss) => ({
        boss: boss.name,
        guild_id: interaction.guildId!,
    }));

    await prisma.guild_bosses.createMany({
        data: guildBossData,
        skipDuplicates: true,
    });

    let results = await guildBossesByCategory(interaction.guildId!);

    let channel = interaction.channel as TextChannel;

    // Send embeds
    let message: string = "";
    interaction.deferReply();
    for (let result in results) {
        message += `**${result}**\n`
        for (let time of results[result]) {
            message += `${time.display_name}: ${time.time}\n`;
        }
        message += "\n";
        await channel.send(message);
        message = "";
    }

    await interaction.editReply("Beep boop, embeds be here");
}

export default initializeHelper;
