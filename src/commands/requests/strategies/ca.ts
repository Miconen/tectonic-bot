import { Requests } from "@requests/main";
import type { CaRequest } from "@typings/requestTypes";
import { formatDisplayName } from "@utils/formatDisplayName";
import type IRankService from "@utils/rankUtils/IRankService";
import { getString } from "@utils/stringRepo";
import { container } from "tsyringe";
import type { RequestStrategy, StrategyResult } from "./strategies";
import { getApiErrorMessage } from "@utils/errors/api/resolver";

export const caStrategy: RequestStrategy<CaRequest> = {
	async accept(interaction, data) {
		const rankService = container.resolve<IRankService>("RankService");

		const res = await Requests.completeCombatAchievement(
			data.guildId,
			data.caName,
			data.members.map((m) => m.id),
		);

		if (res.error) {
			return {
				success: false,
				error: getApiErrorMessage(res, {
					category: "combatAchievementErrors",
				}),
			};
		}

		const msg = [
			getString("ca", "approved", {
				sourceName: data.sourceName,
				points: data.points,
			}),
		];
		const response: StrategyResult = {
			success: true,
			message: [],
		};

		for (const u of res.data) {
			const member = data.members.find((m) => m.id === u.user_id);
			if (!member) continue;

			const oldPoints = u.points - u.given_points;
			const newPoints = u.points;
			const oldRank = rankService.getRankByPoints(oldPoints);
			const newRank = rankService.getRankByPoints(newPoints);
			const oldIcon = rankService.getIcon(oldRank);
			const newIcon = rankService.getIcon(newRank);

			const rankChanged = oldRank !== newRank;

			if (rankChanged) {
				await rankService.rankUpHandler(
					interaction,
					member,
					oldPoints,
					newPoints,
				);

				const template =
					u.given_points >= 0 ? "pointsGrantedRankUp" : "pointsGrantedRankDown";

				msg.push(
					getString("ranks", template, {
						username: member.displayName,
						pointsGiven: u.given_points,
						oldPoints,
						newPoints,
						oldIcon,
						newIcon,
						rankName: formatDisplayName(newRank),
					}),
				);
			} else {
				msg.push(
					getString("ranks", "pointsGranted", {
						username: member.displayName,
						pointsGiven: u.given_points,
						oldPoints,
						newPoints,
						icon: newIcon,
					}),
				);
			}
		}

		response.message = msg;
		return response;
	},
	denyMessage(data) {
		return getString("ca", "denied", {
			sourceName: data.sourceName,
			points: data.points,
			caName: data.caName,
		});
	},
	label(data) {
		return `CA: ${data.caName} | ${data.points}pts — ${data.members.length} players`;
	},
};
