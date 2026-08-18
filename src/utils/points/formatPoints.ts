import type { PointsResponse } from "@typings/api/points";
import { formatDisplayName } from "@utils/formatDisplayName";
import { getRanks } from "@utils/ranks/guildRanks";
import { getRankTransition, type RankTransition } from "@utils/ranks/rankRoles";
import { getString } from "@utils/stringRepo";
import type { BaseInteraction, Collection, GuildMember } from "discord.js";

export function formatPointsAward(
	member: GuildMember,
	pointsGiven: number,
	totalPoints: number,
	transition: RankTransition,
): string {
	const oldPoints = totalPoints - pointsGiven;
	const newPoints = totalPoints;

	let response = getString("ranks", "pointsGranted", {
		username: member.displayName,
		pointsGiven,
		oldPoints,
		newPoints,
		icon: transition.newTier?.icon ?? transition.oldTier?.icon ?? "",
	});

	if (transition.rankChanged && transition.newTier) {
		const template = pointsGiven >= 0 ? "rankUp" : "rankDown";
		response += `\n${getString("ranks", template, {
			username: member.displayName,
			pointsGiven,
			oldPoints,
			newPoints,
			oldIcon: transition.oldTier?.icon ?? "",
			newIcon: transition.newTier.icon ?? "",
			rankName: formatDisplayName(transition.newTier.name),
		})}`;
	}

	return response;
}

export async function buildResponses(
	data: PointsResponse[],
	members: Collection<string, GuildMember>,
	interaction: BaseInteraction<"cached">,
): Promise<string> {
	const ranks = await getRanks(interaction.guild.id);
	const response: string[] = [];

	for (const entry of data) {
		const member = members.get(entry.user_id);
		if (!member) {
			response.push(
				getString("errors", "couldntGetUser", {
					userId: entry.user_id,
				}),
			);
			continue;
		}

		const transition = getRankTransition(
			ranks,
			entry.given_points,
			entry.points,
		);

		response.push(
			formatPointsAward(member, entry.given_points, entry.points, transition),
		);
	}

	return response.join("\n");
}
