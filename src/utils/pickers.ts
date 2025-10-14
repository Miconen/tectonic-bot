import { Requests } from "@requests/main";
import type { Achievement, DetailedUser } from "@typings/requests";
import { Achievements } from "@utils/achievements";
import type { AutocompleteInteraction } from "discord.js";
import { TTLCache } from "@utils/ttlCache";
import { getSources } from "./pointSources";
import { withAutocompleteLogging } from "@logging/guard";
import { getLogger } from "@logging/context";
import { getEvents } from "./events";
import { getGuild } from "./guildTimes";
import TimeConverter from "@commands/pb/func/TimeConverter";

const userCache = new TTLCache<DetailedUser>();
const teamCache = new TTLCache<string[]>();

export async function fetchUser(
	guildId: string,
	userId: string,
): Promise<DetailedUser | undefined> {
	const logger = getLogger();
	const cacheKey = `${guildId}-${userId}`;

	if (userCache.has(cacheKey)) {
		logger.debug(`Hit autocomplete cache for user ${userId}`);
		return userCache.get(cacheKey);
	}

	try {
		const response = await Requests.getUser(guildId, {
			type: "user_id",
			user_id: userId,
		});

		if (response.error || !response.data) {
			logger.warn(
				{
					err: response.error,
				},
				`Failed to fetch user ${userId}`,
			);
			return undefined;
		}

		userCache.set(cacheKey, response.data);
		return response.data;
	} catch (error) {
		logger.error({ err: error }, `Error fetching user ${userId}`);
		return undefined;
	}
}

export async function fetchTeams(
	competitionId: number,
): Promise<string[] | undefined> {
	const logger = getLogger();
	const cacheKey = competitionId.toString();

	if (teamCache.has(cacheKey)) {
		logger.debug(
			`Hit team autocomplete cache for competition ${competitionId}`,
		);
		return teamCache.get(cacheKey);
	}

	try {
		const response = await Requests.getCompetitionTeams(competitionId);

		if (response.error || !response.data) {
			logger.warn(
				{
					err: response.error,
				},
				`Failed to fetch teams for competition ${competitionId}`,
			);
			return undefined;
		}

		teamCache.set(cacheKey, response.data);
		return response.data;
	} catch (error) {
		logger.error(
			{
				err: error,
			},
			`Error fetching teams for competition ${competitionId}`,
		);
		return undefined;
	}
}

// Cache invalidation function for when user data changes
export function invalidateUserCache(guildId: string, userId: string): void {
	const logger = getLogger();
	const cacheKey = `${guildId}-${userId}`;
	userCache.delete(cacheKey);
	logger.debug(`Invalidated user cache for ${userId} in guild ${guildId}`);
}

// Helper function to safely respond to autocomplete interactions
async function safeRespond(
	interaction: AutocompleteInteraction,
	options: { name: string; value: string }[],
): Promise<void> {
	const logger = getLogger();
	try {
		await interaction.respond(options.slice(0, 25));
	} catch (error) {
		logger.error(
			{
				err: error,
			},
			"Error responding to autocomplete interaction:",
		);
	}
}

export const achievementAddPicker = withAutocompleteLogging(
	"achievementAddPicker",
	async (interaction: AutocompleteInteraction): Promise<void> => {
		const picker = (u: Achievement[], a: Achievement) =>
			!u.some((ua) => ua.name === a.name);
		achievementPicker(interaction, picker);
	},
);

export const achievementRemovePicker = withAutocompleteLogging(
	"achievementRemovePicker",
	async (interaction: AutocompleteInteraction): Promise<void> => {
		const picker = (u: Achievement[], a: Achievement) =>
			u.some((ua) => ua.name === a.name);
		achievementPicker(interaction, picker);
	},
);

export async function achievementPicker(
	interaction: AutocompleteInteraction,
	picker: (u: Achievement[], a: Achievement) => boolean,
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

	const achievements = Achievements.toArray().filter((a) =>
		picker(user.achievements, a),
	);

	const options = achievements.map((achievement) => ({
		name: achievement.name,
		value: achievement.name,
	}));

	await safeRespond(interaction, options);
}

export const rsnPicker = withAutocompleteLogging(
	"rsnPicker",
	async (interaction: AutocompleteInteraction): Promise<void> => {
		if (!interaction.guild?.id) {
			await safeRespond(interaction, []);
			return;
		}

		const logger = getLogger();

		const id =
			interaction.options.get("username")?.value ?? interaction.user.id;
		if (!id || typeof id !== "string") {
			await safeRespond(interaction, []);
			return;
		}

		const user = await fetchUser(interaction.guild.id, id);
		if (!user || !user.rsns || !Array.isArray(user.rsns)) {
			await safeRespond(interaction, []);
			return;
		}

		const query = interaction.options
			.getFocused(true)
			.value.toLowerCase()
			.trim();

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
			logger.debug(`No RSNs found for user ${id} after filtering`);
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
	},
);

export const teamPicker = withAutocompleteLogging(
	"teamPicker",
	async (interaction: AutocompleteInteraction): Promise<void> => {
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
	},
);

export const pointSourcePicker = withAutocompleteLogging(
	"pointSourcePicker",
	async (interaction: AutocompleteInteraction): Promise<void> => {
		if (!interaction.guild?.id) {
			await safeRespond(interaction, []);
			return;
		}

		const sources = await getSources(interaction.guild.id);
		if (!sources) return;

		const options = Array.from(sources.values()).map((s) => ({
			name: `${s.name} | ${s.points} points`,
			value: s.source,
		}));

		await safeRespond(interaction, options);
	},
);

export const eventPicker = withAutocompleteLogging(
	"eventPicker",
	async (interaction: AutocompleteInteraction): Promise<void> => {
		if (!interaction.guild?.id) {
			await safeRespond(interaction, []);
			return;
		}

		const events = await getEvents(interaction.guild.id);
		if (!events) {
			await safeRespond(interaction, [])
			return
		};

		const query = interaction.options
			.getFocused(true)
			.value.toLowerCase()
			.trim() ?? "";

		const options = events
			.filter((e) => e.name.toLowerCase().includes(query))
			.map((e) => ({
				name: e.name,
				value: e.wom_id,
			}));

		await safeRespond(interaction, options);
	},
);

export const bossTimePicker = withAutocompleteLogging(
	"bossTimePicker",
	async (interaction: AutocompleteInteraction): Promise<void> => {
		if (!interaction.guild?.id) {
			await safeRespond(interaction, []);
			return;
		}

		const search = interaction.options.get("boss")?.value;
		if (search === undefined || typeof search !== "string") {
			await safeRespond(interaction, []);
			return;
		}

		const guild = await getGuild(interaction.guild.id);
		if (!guild) {
			await safeRespond(interaction, []);
			return;
		}

		if (!guild.pbs) {
			await safeRespond(interaction, []);
			return;
		}

		// Get all boss options first
		const allOptions = guild.pbs.flatMap((t) => {
			const boss = guild.bosses.find((b) => b.name === t.boss_name);
			return boss
				? [
					{
						name: `${boss.category} | ${boss.display_name} - ${TimeConverter.ticksToTime(t.time)} (${t.time} ticks)`,
						value: t.boss_name,
					},
				]
				: [];
		});

		// Filter options based on search input
		const searchLower = search.toLowerCase();
		const filteredOptions = allOptions.filter((option) =>
			option.name.toLowerCase().includes(searchLower),
		);

		await safeRespond(interaction, filteredOptions);
	},
);
