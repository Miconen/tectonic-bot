import { formatDisplayName } from "@utils/formatDisplayName";
import type { RankTransition } from "@ranks/rankRoles";
import { getString } from "@utils/stringRepo";
import type { GuildMember } from "discord.js";

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
		oldIcon: transition.oldTier?.icon ?? "",
		newIcon: transition.newTier?.icon ?? transition.oldTier?.icon ?? "",
	});

	if (transition.rankChanged && transition.newTier) {
		const template = pointsGiven >= 0 ? "rankUp" : "rankDown";
		response += `\n${getString("ranks", template, {
			newIcon: transition.newTier.icon ?? "",
			rankName: formatDisplayName(transition.newTier.name),
		})}`;
	}

	return response;
}
