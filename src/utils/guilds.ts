import type { DetailedGuild } from "@typings/requests";
import { notEmpty } from "./notEmpty";
import { getString } from "./stringRepo";

export function formatGuildTimes(data: DetailedGuild) {
	// Create combined bosses data
	const bosses = data.guild_bosses
		.map((gb) => {
			const pb = data.pbs?.find((t) => t.run_id === gb.pb_id);
			const teammates = data.teammates?.filter((tm) => tm.run_id === gb.pb_id);

			// Find all guild_bosses entries for this boss
			const boss = data.bosses.find((b) => b.name === gb.boss);
			if (!boss) {
				console.log(
					getString("error", "empty", { target: "boss in formatGuildTimes()" }),
				);
				return;
			}

			// Return combined data
			return { ...gb, ...boss, pb, teammates };
		})
		.filter(notEmpty);

	// Create combined categories data
	const categories = data.guild_categories
		.map((gc) => {
			const bs = bosses
				.filter((b) => b.category === gc.category)
				.sort((a, b) => a.name.localeCompare(b.name));

			// Find all guild_categories entries for this category
			const category = data.categories.find((c) => gc.category === c.name);
			if (!category) {
				console.log(
					getString("error", "empty", {
						target: "category in formatGuildTimes()",
					}),
				);
				return;
			}

			// Return combined data
			return { ...gc, ...category, bosses: bs };
		})
		.filter(notEmpty)
		.sort((a, b) => a.order - b.order);

	return categories;
}
