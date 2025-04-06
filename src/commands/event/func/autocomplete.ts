import { Requests } from "@requests/main";
import type { AutocompleteInteraction } from "discord.js";

const teamCache = new Map<number, string[]>(); // simple in-memory cache

export async function fetchTeams(competitionId: number) {
	if (teamCache.has(competitionId)) {
		console.log(`Hit team autocomplete cache for user ${competitionId}`);
		return teamCache.get(competitionId);
	}

	const user = await Requests.getCompetitionTeams(competitionId);

	if (user.error) return;
	if (!user.data) return;
	teamCache.set(competitionId, user.data);

	setTimeout(() => teamCache.delete(competitionId), 30 * 1000);
	return user.data;
}

export async function teamPicker(interaction: AutocompleteInteraction) {
	console.log("Got to team picker");
	if (!interaction.guild?.id) return;
	console.log("Found guild");
	const competitionId = interaction.options.get("competition")?.value;
	console.log("Competition ID:", competitionId);
	if (!competitionId || typeof competitionId !== "number") return;

	const teams = await fetchTeams(competitionId);
	if (!teams) return;

	const options = teams.map((team) => ({
		name: team,
		value: team,
	}));

	// Respond with the options (limit to 25 as per Discord's requirements)
	interaction.respond(options.slice(0, 25));
}
