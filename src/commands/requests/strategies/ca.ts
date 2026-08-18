import { Requests } from "@requests/main";
import type { CaRequest } from "@typings/requestTypes";
import { getString } from "@utils/stringRepo";
import type { RequestStrategy, StrategyResult } from "./strategies";
import { getApiErrorMessage } from "@utils/errors/api/resolver";
import { applyRankTransition } from "@utils/ranks/rankRoles";
import { getRanks } from "@utils/ranks/guildRanks";
import { formatPointsAward } from "@utils/points/formatPoints";

export const caStrategy: RequestStrategy<CaRequest> = {
	async accept(interaction, data) {
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

		const ranks = await getRanks(interaction.guild.id);
		for (const u of res.data) {
			const member = data.members.find((m) => m.id === u.user_id);
			if (!member) continue;

			const oldPoints = u.points - u.given_points;
			const newPoints = u.points;

			const transition = await applyRankTransition(
				member,
				ranks,
				oldPoints,
				newPoints,
			);

			msg.push(formatPointsAward(member, u.given_points, u.points, transition));
		}

		const response: StrategyResult = {
			success: true,
			message: msg,
		};

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
