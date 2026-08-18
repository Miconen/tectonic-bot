import { Requests } from "@requests/main.js";
import type {
	CustomPoints,
	PointsParam,
	PointsResponse,
	PresetPoints,
} from "@typings/api/points.js";
import { formatDisplayName } from "@utils/formatDisplayName.js";
import { getString } from "@utils/stringRepo.js";
import type {
	BaseInteraction,
	ButtonInteraction,
	CommandInteraction,
	GuildMember,
} from "discord.js";
import { Collection } from "discord.js";
import { singleton } from "tsyringe";
import type IPointService from "./IPointService.js";
import { getApiErrorMessage } from "@utils/errors/api/resolver.js";
import { tierForPoints } from "@utils/ranks/tierMath.js";
import { getRanks } from "@utils/ranks/guildRanks.js";
import { syncRankRolesIfChanged } from "@utils/ranks/rankRoles.js";
import type { StrategyResult } from "@commands/requests/strategies/strategies.js";

@singleton()
export class PointService implements IPointService {
	async givePoints(
		value: string | number,
		target: GuildMember | Collection<string, GuildMember>,
		interaction: CommandInteraction<"cached"> | ButtonInteraction<"cached">,
	): Promise<StrategyResult> {
		const points =
			typeof value === "number"
				? ({ type: "custom" as const, amount: value } as CustomPoints)
				: ({ type: "preset" as const, event: value } as PresetPoints);

		const userIds =
			target instanceof Collection ? target.map((m) => m.id) : [target.id];

		const members =
			target instanceof Collection
				? target
				: new Collection<string, GuildMember>([[target.id, target]]);

		const param: PointsParam = { user_id: userIds, points };

		const res = await Requests.givePointsToMultiple(
			interaction.guild.id,
			param,
		);
		if (res.error) {
			return {
				success: false,
				error: getApiErrorMessage(res, { category: "guildErrors" }),
			};
		}

		return {
			success: true,
			message: await this.buildResponses(res.data, members, interaction),
		};
	}

	private async buildResponses(
		data: PointsResponse[],
		members: Collection<string, GuildMember>,
		interaction: BaseInteraction<"cached">,
	): Promise<string[]> {
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

			response.push(await this.buildPointsLine(entry, member, interaction));
		}

		return response;
	}

	private async buildPointsLine(
		entry: PointsResponse,
		member: GuildMember,
		interaction: BaseInteraction<"cached">,
	): Promise<string> {
		const ranks = await getRanks(interaction.guild.id);

		const oldPoints = entry.points - entry.given_points;
		const newPoints = entry.points;

		const oldRank = tierForPoints(oldPoints, ranks);
		const newRank = await syncRankRolesIfChanged(
			member,
			ranks,
			oldPoints,
			newPoints,
		);

		if (newRank) {
			const template =
				entry.given_points >= 0
					? "pointsGrantedRankUp"
					: "pointsGrantedRankDown";

			return getString("ranks", template, {
				username: member.displayName,
				pointsGiven: entry.given_points,
				oldPoints,
				newPoints,
				oldRank: oldRank?.icon ?? "",
				newIcon: newRank.icon,
				rankName: formatDisplayName(newRank.name),
			});
		}

		return getString("ranks", "pointsGranted", {
			username: member.displayName,
			pointsGiven: entry.given_points,
			oldPoints,
			newPoints,
			icon: oldRank?.icon ?? "",
		});
	}
}
