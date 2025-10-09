import type { Category, DetailedGuild } from "@typings/requests";
import { notEmpty } from "./notEmpty";
import { getString } from "./stringRepo";

export type EmbedBossData = {
	name: string;
	display_name: string;
	pb_time_ticks: number | null;
	teammate_user_ids: string[];
};

export type EmbedCategoryData = {
	name: string;
	thumbnail: string;
	message_id: string | null;
	bosses: EmbedBossData[];
};

export function formatGuildTimesForEmbeds(
	data: DetailedGuild
): EmbedCategoryData[] {
	return data.guild_categories
		.map((gc) => {
			const category = data.categories.find((c) => c.name === gc.category);
			if (!category) return null;

			const bosses = formatGuildBossesForEmbeds(data, category)

			return {
				name: category.name,
				thumbnail: category.thumbnail,
				message_id: gc.message_id ?? null,
				bosses,
				order: category.order,
			};
		})
		.filter(notEmpty)
		.sort((a, b) => a.order - b.order);
}

export function formatGuildBossesForEmbeds(data: DetailedGuild, category: Category) {
	return data.guild_bosses
		.filter((gb) => gb.category === category.name)
		.map((gb) => {
			const boss = data.bosses.find((b) => b.name === gb.boss);
			if (!boss) return null;

			const pb = data.pbs?.find((t) => t.run_id === gb.pb_id);
			const teammates = data.teammates?.filter(
				(tm) => tm.run_id === gb.pb_id
			);

			// Extract ONLY what embeds need
			return {
				display_name: boss.display_name,
				name: boss.name,
				pb_time_ticks: pb?.time ?? null,
				teammate_user_ids: teammates?.map(t => t.user_id) ?? [],
			};
		})
		.filter(notEmpty)
		.sort((a, b) => a.display_name.localeCompare(b.display_name));
}
