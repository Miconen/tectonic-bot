import { withInitLogging } from "@logging/context";
import { Requests } from "@requests/main";
import type { Boss } from "@typings/requests";
import { TTLCache } from "@utils/ttlCache";
import type { SlashChoiceType } from "discordx";

export const Bosses = new TTLCache<Boss>();

async function bossesAsChoices() {
	const res = await Requests.getBosses();
	if (res.error) {
		throw new Error(
			"Could not fetch bosses from database in bossesAsChoices()",
		);
	}

	const bossesByCategory: Record<string, SlashChoiceType[]> = {};

	for (const boss of res.data) {
		const { category, name, display_name } = boss;

		Bosses.set(name, boss);

		if (!bossesByCategory[category]) {
			bossesByCategory[category] = [];
		}

		const choice = {
			name: display_name,
			value: name,
		};

		// HACK: We want to exclude these from the miscellaneous command since they have their own... for now...
		if (category === "Miscellaneous" && name === "royal_titans_2") {
			continue;
		}
		if (category === "Miscellaneous" && name === "yama_2") {
			continue;
		}

		bossesByCategory[category].push(choice);
	}

	return bossesByCategory;
}

const bossCategories: Record<string, SlashChoiceType[]> = await withInitLogging(
	"Boss categories initialization",
	bossesAsChoices,
);

export default bossCategories;
