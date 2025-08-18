import { Requests } from "@requests/main";
import type { DetailedUser } from "@typings/requests";
import { Achievements } from "@utils/achievements";
import type { AutocompleteInteraction } from "discord.js";
import { TTLCache } from "@utils/ttlCache";

const userCache = new TTLCache<DetailedUser>();
const teamCache = new TTLCache<string[]>();

export async function fetchUser(
	guildId: string,
	userId: string,
): Promise<DetailedUser | undefined> {
	const cacheKey = `${guildId}-${userId}`;

	if (userCache.has(cacheKey)) {
		console.log(`Hit autocomplete cache for user ${userId}`);
		return userCache.get(cacheKey);
	}

	try {
		const response = await Requests.getUser(guildId, {
			type: "user_id",
			user_id: userId,
		});

		if (response.error || !response.data) {
			console.warn(`Failed to fetch user ${userId}:`, response.error);
			return undefined;
		}

		userCache.set(cacheKey, response.data);
		return response.data;
	} catch (error) {
		console.error(`Error fetching user ${userId}:`, error);
		return undefined;
	}
}

export async function fetchTeams(
	competitionId: number,
): Promise<string[] | undefined> {
	const cacheKey = competitionId.toString();

	if (teamCache.has(cacheKey)) {
		console.log(`Hit team autocomplete cache for competition ${competitionId}`);
		return teamCache.get(cacheKey);
	}

	try {
		const response = await Requests.getCompetitionTeams(competitionId);

		if (response.error || !response.data) {
			console.warn(
				`Failed to fetch teams for competition ${competitionId}:`,
				response.error,
			);
			return undefined;
		}

		teamCache.set(cacheKey, response.data);
		return response.data;
	} catch (error) {
		console.error(
			`Error fetching teams for competition ${competitionId}:`,
			error,
		);
		return undefined;
	}
}

// Cache invalidation function for when user data changes
export function invalidateUserCache(guildId: string, userId: string): void {
	const cacheKey = `${guildId}-${userId}`;
	userCache.delete(cacheKey);
	console.log(`Invalidated user cache for ${userId} in guild ${guildId}`);
}

// Helper function to safely respond to autocomplete interactions
async function safeRespond(
	interaction: AutocompleteInteraction,
	options: { name: string; value: string }[],
): Promise<void> {
	try {
		await interaction.respond(options.slice(0, 25));
	} catch (error) {
		console.error("Error responding to autocomplete interaction:", error);
	}
}

export async function achievementPicker(
	interaction: AutocompleteInteraction,
): Promise<void> {
	if (!interaction.guild?.id) {
		await safeRespond(interaction, []);
		return;
	}

	const id = interaction.options.get("username")?.value ?? interaction.user.id;
	if (!id || typeof id !== "string") {
		await safeRespond(interaction, []);
		return;
	}

	const user = await fetchUser(interaction.guild.id, id);
	if (!user || !user.achievements || !Array.isArray(user.achievements)) {
		await safeRespond(interaction, []);
		return;
	}

	const achievements = Achievements.filter(
		(a) => !user.achievements.some((ua) => ua.name === a.name),
	);

	const options = achievements.map((achievement) => ({
		name: achievement.name,
		value: achievement.name,
	}));

	await safeRespond(interaction, options);
}

export async function rsnPicker(
	interaction: AutocompleteInteraction,
): Promise<void> {
	if (!interaction.guild?.id) {
		await safeRespond(interaction, []);
		return;
	}

	const id = interaction.options.get("username")?.value ?? interaction.user.id;
	if (!id || typeof id !== "string") {
		await safeRespond(interaction, []);
		return;
	}

	const user = await fetchUser(interaction.guild.id, id);
	if (!user || !user.rsns || !Array.isArray(user.rsns)) {
		await safeRespond(interaction, []);
		return;
	}

	const query = interaction.options.getFocused(true).value.toLowerCase().trim();

	let filteredRsns = user.rsns;
	if (query) {
		filteredRsns = user.rsns.filter((rsn) => {
			// More defensive check for rsn object structure
			return (
				rsn &&
				typeof rsn === "object" &&
				"rsn" in rsn &&
				typeof rsn.rsn === "string" &&
				rsn.rsn.toLowerCase().includes(query)
			);
		});
	}

	if (!filteredRsns || filteredRsns.length === 0) {
		console.log(`No RSNs found for user ${id} after filtering`);
		await safeRespond(interaction, []);
		return;
	}

	const options = filteredRsns
		.map((rsn) => ({
			name: rsn.rsn,
			value: rsn.rsn,
		}))
		.filter(
			(option) =>
				option.name &&
				option.value &&
				option.name.trim() !== "" &&
				option.value.trim() !== "",
		);

	await safeRespond(interaction, options);
}

export async function teamPicker(
	interaction: AutocompleteInteraction,
): Promise<void> {
	if (!interaction.guild?.id) {
		await safeRespond(interaction, []);
		return;
	}

	const competitionId = interaction.options.get("competition")?.value;
	if (!competitionId || typeof competitionId !== "number") {
		await safeRespond(interaction, []);
		return;
	}

	const teams = await fetchTeams(competitionId);
	if (!teams || teams.length === 0) {
		await safeRespond(interaction, []);
		return;
	}

	const options = teams
		.filter((team) => team && typeof team === "string" && team.trim() !== "")
		.map((team) => ({
			name: team,
			value: team,
		}));

	await safeRespond(interaction, options);
}
