import { Requests } from "@requests/main"
import { SlashChoiceType } from "discordx"

async function bossesAsChoices() {
    const bossesByCategory: Record<string, SlashChoiceType[]> = {}

    for (const boss of await Requests.getBosses()) {
        const { category, name, display_name } = boss

        if (!bossesByCategory[category]) {
            bossesByCategory[category] = []
        }

        let choice = {
            name: display_name,
            value: name,
        }

        // HACK: We want to exclude these from the miscellaneous command since they have their own... for now...
        if (category === "Miscellaneous" && (name === "royal_titans_1" || name === "royal_titans_2")) continue;

        bossesByCategory[category].push(choice)
    }

    return bossesByCategory
}

const bossCategories: Record<string, SlashChoiceType[]> =
    await bossesAsChoices()

export default bossCategories
