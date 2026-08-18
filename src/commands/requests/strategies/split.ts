import type { SplitRequest } from "@typings/requestTypes";
import { getString } from "@utils/stringRepo";
import type { RequestStrategy } from "./strategies";
import { awardPoints } from "@points/awardPoints";

export const splitStrategy: RequestStrategy<SplitRequest> = {
	async accept(interaction, data) {
		// Only the submitter gets points
		const submitter = data.members[0];
		const result = await awardPoints(data.points, submitter, interaction);

		if (!result.success) {
			return result;
		}

		const pointsResult = Array.isArray(result.message)
			? result.message.join("\n")
			: result.message;

		return {
			success: true,
			message: [
				getString("splits", "approved", {
					sourceName: data.sourceName,
					points: data.points,
				}),
				pointsResult,
			],
		};
	},
	denyMessage(data) {
		return getString("splits", "denied", {
			sourceName: data.sourceName,
			points: data.points,
			username: data.members[0].displayName,
		});
	},
	label(data) {
		return `Split: ${data.sourceName} | ${data.points}pts — ${data.members[0].displayName}`;
	},
};
