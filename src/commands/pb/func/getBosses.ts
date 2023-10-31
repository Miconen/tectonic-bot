import { SlashChoiceType } from 'discordx';
import type IDatabase from "../../../database/IDatabase"

import { container } from "tsyringe"

async function bossesAsChoices() {
    const database = container.resolve<IDatabase>("Database")

    const bossesByCategory: Record<string, SlashChoiceType[]> = {};

    for (const boss of await database.getBosses()) {
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
