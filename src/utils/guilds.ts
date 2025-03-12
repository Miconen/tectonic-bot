import { GuildTimes } from "@typings/requests";
import { notEmpty } from "./notEmpty";

export function formatGuildTimes(data: GuildTimes) {

    // Create combined bosses data
    const bosses = data.guild_bosses.map(gb => {
        if (!data.pbs) return
        if (!data.teammates) return
        let pb = data.pbs.find(t => t.run_id === gb.pb_id)
        let teammates = data.teammates.filter(tm => tm.run_id === gb.pb_id)

        // Find all guild_bosses entries for this boss
        const boss = data.bosses.find(b => b.name === gb.boss);

        if (!boss) return

        // Return combined data
        return { ...gb, ...boss, pb, teammates };
    }).filter(notEmpty);

    // Create combined categories data
    const categories = data.guild_categories.map(gc => {
        let bs = bosses.filter(b => b.category === gc.category)

        // Find all guild_categories entries for this category
        const category = data.categories.find(c => gc.category === c.name);

        if (!category) return

        // Return combined data
        return { ...gc, ...category, bosses: bs };
    }).filter(notEmpty).sort((a, b) => a.order - b.order);

    return categories
}
