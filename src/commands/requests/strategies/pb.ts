import type { PbRequest } from "@typings/requestTypes";
import type { RequestStrategy } from "./strategies";
import { Requests } from "@requests/main.js";
import { Bosses } from "@commands/pb/func/getBosses.js";
import TimeConverter from "@commands/pb/func/TimeConverter.js";
import updateEmbed from "@commands/pb/func/updateEmbed.js";
import { formatValueLabel } from "@commands/pb/func/valueFormat.js";
import { getApiErrorMessage } from "@errors/api/resolver.js";
import { getString } from "@utils/stringRepo.js";
import { getLogger } from "@logging/context.js";
import { awardPoints } from "@points/awardPoints";

export const pbStrategy: RequestStrategy<PbRequest> = {
	async accept(interaction, data) {
		const guildId = interaction.guild.id;
		const logger = getLogger();

		// Resolve boss metadata to determine value type
		const bossData = Bosses.get(data.boss);
		const valueType = bossData?.value_type ?? "time";

		// Parse input based on value type
		let value: number;
		if (valueType === "time") {
			const ticks = TimeConverter.timeToTicks(data.time);
			if (!ticks) {
				const errorMsg = getString("times", "failedParsingTicks");
				logger.error(errorMsg);
				return { success: false, error: errorMsg };
			}
			value = ticks;
		} else {
			value = Number.parseInt(data.time, 10);
			if (Number.isNaN(value) || value < 1) {
				return {
					success: false,
					error: getString("times", "failedParsingTicks"),
				};
			}
		}

		// 1. Post new record to API
		const res = await Requests.newTime(guildId, {
			user_ids: data.team,
			value,
			boss_name: data.boss,
		});

		if (res.error) {
			return {
				success: false,
				error: getApiErrorMessage(res, { category: "recordErrors" }),
			};
		}

		const position = res.data.position;
		if (position === null || position === undefined) {
			return {
				success: true,
				message: getString("times", "timeSubmittedNotPb"),
			};
		}

		logger.info(res.data, `New clan record at position #${position}`);

		// Format display values using data precomputed on submission
		const valueLabel = formatValueLabel(valueType);
		const displayValue =
			valueType === "time"
				? `${TimeConverter.ticksToTime(res.data.value)} (${res.data.value} ticks)`
				: `${res.data.value}`;

		const response: string[] = [
			getString("times", "newPb", {
				position,
				bossTitle: data.bossTitle,
				valueLabel,
				displayValue,
				sourceName: data.sourceName,
				points: data.points,
			}),
		];

		// Only position #1 gets points awarded and embed updated
		if (position === 1) {
			await updateEmbed(data.boss, interaction);

			const members = await interaction.guild.members.fetch({
				user: data.team,
			});

			const pointsResult = await awardPoints("clan_pb", members, interaction);

			if (!pointsResult.success) {
				return pointsResult;
			}

			const pointsLines = Array.isArray(pointsResult.message)
				? pointsResult.message.join("\n")
				: pointsResult.message;

			response.push(pointsLines);
		}

		return {
			success: true,
			message: response.join("\n"),
		};
	},

	denyMessage(data) {
		return getString("pb", "denied", {
			bossTitle: data.bossTitle,
			sourceName: data.sourceName,
			points: data.points,
		});
	},

	label(data) {
		return `PB: ${data.boss} ${data.time} — ${data.team.length} players`;
	},
};
