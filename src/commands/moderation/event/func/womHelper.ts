import type { CommandInteraction, GuildMember } from "discord.js";
import { replyHandler } from "@utils/replyHandler.js";
import { container } from "tsyringe";

import { Requests } from "@requests/main";
import type IRankService from "@utils/rankUtils/IRankService";
import { getString } from "@utils/stringRepo";

async function womHelper(
	competitionId: number,
	interaction: CommandInteraction,
	cutoff: number,
) {
	if (!interaction.guild) {
		await replyHandler(getString("errors", "noGuild"), interaction, {
			ephemeral: true,
		});
		return;
	}

	if (!interaction.member) {
		await replyHandler(getString("errors", "noMember"), interaction, {
			ephemeral: true,
		});
		return;
	}

	const member = interaction.member as GuildMember;

	// Services and data fetching
	const rankService = container.resolve<IRankService>("RankService");
	const competition = await Requests.eventCompetition(
		interaction.guild.id,
		competitionId,
		cutoff,
	);

	// Process RSN data
	if (competition.error) {
		await replyHandler(getString("errors", "competitionError"), interaction, {
			ephemeral: true,
		});
		return;
	}

	if (!competition.data.participants || !competition.data.accounts) {
		await replyHandler(getString("errors", "competitionError"), interaction, {
			ephemeral: true,
		});
		return;
	}

	interaction.deferReply();

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

			responseLines.push(
				getString("ranks", "pointsGranted", {
					username: user?.displayName ?? "???",
					pointsGiven: competition.data.points_given,
					grantedBy: member.displayName,
					totalPoints: participant.points,
				}),
			);

			if (!user) continue;

			const newRank = await rankService.rankUpHandler(
				interaction,
				user,
				competition.data.points_given,
				participant.points,
			);

			if (!newRank) continue;

			// Concatenate level up message to response if user leveled up
			responseLines.push(
				getString("ranks", "levelUpMessage", {
					username: user.displayName,
					icon: rankService.getIcon(newRank),
					rankName: newRank.replace("_", " "),
				}),
			);
		}
	}
	if (unlinked) {
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
