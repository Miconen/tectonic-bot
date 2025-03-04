import { Requests } from "@requests/main"
import { SlashChoiceType } from "discordx"

async function bossesAsChoices() {
    const bossesByCategory: Record<string, SlashChoiceType[]> = {}

    for (const boss of Requests.getBosses()) {
        const { category, name, display_name } = boss

        if (!bossesByCategory[category]) {
            bossesByCategory[category] = []
        }

        let choice = {
            name: display_name,
            value: name,
        }

        bossesByCategory[category].push(choice)
    }

    return bossesByCategory
}

const bossCategories: Record<string, SlashChoiceType[]> =
    await bossesAsChoices()

export default bossCategories
