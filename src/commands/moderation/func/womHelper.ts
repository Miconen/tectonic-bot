import { Requests } from "@requests/main";
import { getRanks } from "@ranks/guildRanks.js";
import { applyRankTransition } from "@ranks/rankRoles";
import { tierForPoints } from "@ranks/tierMath.js";
import { replyApiError } from "@utils/replyApiError.js";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import { MessageFlags, type CommandInteraction } from "discord.js";

async function womHelper(
	competitionId: number,
	interaction: CommandInteraction<"cached">,
	cutoff: number,
) {
	// Services and data fetching
	const ranks = await getRanks(interaction.guild.id);
	const competition = await Requests.eventCompetition(
		interaction.guild.id,
		competitionId,
		cutoff,
	);

	if (competition.error) {
		return await replyApiError(competition, interaction, {
			category: "eventErrors",
			args: {
				competition: competitionId,
			},
		});
	}

	if (
		!competition.data.participants?.length ||
		!competition.data.accounts?.length
	) {
		await replyHandler(
			getString("competitions", "noEligibleParticipants"),
			interaction,
			{
				flags: MessageFlags.Ephemeral,
			},
		);
		return;
	}

	const rsns = competition.data.participants.flatMap((u) =>
		u.rsns.map((r) => r.rsn),
	);
	const participated = new Set(rsns);
	const unlinked = competition.data.accounts.filter(
		(name) => !participated.has(name),
	);

	// Fetch Discord users
	const discordIds = competition.data.participants.map((u) => u.user_id);
	const discordUsers = await interaction.guild.members.fetch({
		user: discordIds,
	});

	// Build the response string
	const responseLines: string[] = [];

	// Header section
	responseLines.push(
		getString("competitions", "header", { title: competition.data.title }),
	);
	responseLines.push(
		getString("competitions", "participantCount", {
			count: competition.data.participant_count,
		}),
	);
	responseLines.push(
		getString("competitions", "eligibleCount", {
			eligibleCount: competition.data.participants.length,
		}),
	);

	if (competition.data.participants.length) {
		responseLines.push(getString("competitions", "pointsHeader"));
		for (const participant of competition.data.participants) {
			const user = discordUsers.get(participant.user_id);
			if (!user) continue;

			const newPoints = participant.points;
			const oldPoints = newPoints - competition.data.points_given;
			const transition = await applyRankTransition(
				user,
				ranks,
				oldPoints,
				newPoints,
			);

			responseLines.push(
				getString("ranks", "pointsGranted", {
					username: user?.displayName ?? "???",
					pointsGiven: competition.data.points_given,
					oldPoints,
					newPoints,
					oldIcon: transition.oldTier?.icon ?? "",
					newIcon: transition.newTier?.icon ?? transition.oldTier?.icon ?? "",
				}),
			);

			if (!transition.rankChanged) continue;
			// Concatenate level up message to response if user leveled up
			responseLines.push(
				getString("ranks", "levelUpMessage", {
					username: user.displayName,
					icon: transition.newTier?.icon ?? "",
					rankName: transition.newTier?.name.replace("_", " "),
				}),
			);
		}
	}

	if (unlinked.length) {
		responseLines.push(getString("accounts", "unlinkedHeader"));

		for (const account of unlinked) {
			responseLines.push(
				getString("accounts", "unlinkedAccount", {
					rsn: account,
					pointsGiven: competition.data.points_given,
				}),
			);
		}

		responseLines.push(getString("accounts", "unlinkInstructions"));
	}

	await replyHandler(responseLines.join("\n"), interaction);
}

export default womHelper;
