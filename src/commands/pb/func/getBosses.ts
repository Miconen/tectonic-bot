import { SlashChoiceType } from 'discordx';
import prisma from '../../../database/client.js';

async function getBosses() {
    return await prisma.bosses.findMany({
        orderBy: {
            category: 'asc',
        },
    });
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
        };

        bossesByCategory[category].push(choice);
    }

    return bossesByCategory;
}

const bossCategories: Record<string, SlashChoiceType[]> =
    await bossesAsChoices();

export default bossCategories;
