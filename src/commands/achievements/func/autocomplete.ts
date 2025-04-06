import { Requests } from "@requests/main";
import type { DetailedUser } from "@typings/requests";
import { Achievements } from "@utils/achievements";
import type { AutocompleteInteraction } from "discord.js";

const userCache = new Map<string, DetailedUser>(); // simple in-memory cache

export async function fetchUser(guildId: string, userId: string) {
	if (userCache.has(userId)) {
		console.log(`Hit autocomplete cache for user ${userId}`);
		return userCache.get(userId);
	}

	const user = await Requests.getUser(guildId, {
		type: "user_id",
		user_id: userId,
	});

	if (user.error) return;
	if (!user.data) return;
	userCache.set(userId, user.data);

	setTimeout(() => userCache.delete(userId), 30 * 1000);
	return user.data;
}

export async function achievementPicker(interaction: AutocompleteInteraction) {
	if (!interaction.guild?.id) return;

	const options = Achievements.map((a) => ({
		name: a.name,
		value: a.name,
	}));

	// Respond with the options (limit to 25 as per Discord's requirements)
	interaction.respond(options.slice(0, 25));
}

export async function rsnPicker(interaction: AutocompleteInteraction) {
	if (!interaction.guild?.id) return;
	const id = interaction.options.get("username")?.value ?? interaction.user.id;
	if (!id || typeof id !== "string") return;

	const user = await fetchUser(interaction.guild.id, id);

	if (!user) return;

	let rsns = user.rsns;

	const query = interaction.options.getFocused(true).value.toLowerCase();
	if (query) {
		rsns = user.rsns.filter((rsn) => rsn.rsn.toLowerCase().includes(query));
	}

	if (!rsns) return interaction.respond([]);

	// Convert Map entries to an array of autocomplete options
	const options = rsns.map((rsn) => ({
		name: rsn.rsn,
		value: rsn.rsn,
	}));

	// Respond with the options (limit to 25 as per Discord's requirements)
	interaction.respond(options.slice(0, 25));
}
