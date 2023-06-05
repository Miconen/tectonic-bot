import { SlashChoiceType } from "discordx";
import prisma from "../../../database/client.js";

type BossData = {
    name: string,
    display_name: string,
    solo: boolean,
}

type GuildBossData = {
    display_name: string,
    time: number | string,
}

async function getGuildBosses(guildId: string) {
    return await prisma.guild_bosses.findMany({
        where: {
            guild_id: guildId,
        },
        include: {
            bosses: true,
            times: true,
        },
        orderBy: {
            bosses: {
                category: 'asc',
            },
        },
    });
}

async function getBosses() {
    return await prisma.bosses.findMany({
        orderBy: {
            category: 'asc',
        },
    });
}

export async function guildBossesByCategory(guildId: string) {
    const bossesByCategory: Record<string, GuildBossData[]> = {};

    for (const boss of await getGuildBosses(guildId)) {
        const { category, display_name } = boss.bosses;

        if (!bossesByCategory[category]) {
            bossesByCategory[category] = [];
        }

        bossesByCategory[category].push({ display_name, time: boss.times?.time ?? "No time" });
    }

    return bossesByCategory;
}

async function bossesAsChoices() {
    const bossesByCategory: Record<string, SlashChoiceType[]> = {};

    for (const boss of await getBosses()) {
        const { category, name, display_name } = boss;

        if (!bossesByCategory[category]) {
            bossesByCategory[category] = [];
        }

        let choice = {
            name: display_name,
            value: name,
        }

        bossesByCategory[category].push(choice);
    }

    return bossesByCategory;
}

const bossCategories: Record<string, SlashChoiceType[]> = await bossesAsChoices();

export default bossCategories;
