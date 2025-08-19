import { Requests } from "@requests/main.js";
import { getPoints } from "@utils/pointSources.js";
import { getString } from "@utils/stringRepo.js";
import type { BaseInteraction, GuildMember } from "discord.js";
import { Collection } from "discord.js";
import { inject, injectable, singleton } from "tsyringe";
import type IRankService from "../rankUtils/IRankService.js";
import type IPointService from "./IPointService.js";

@singleton()
@injectable()
export class PointService implements IPointService {
	constructor(@inject("RankService") private rankService: IRankService) {}

	async givePoints(
		value: string | number,
		target: GuildMember | Collection<string, GuildMember>,
		interaction: BaseInteraction,
	) {
		if (!interaction.guild) return getString("errors", "noGuild");

		// Ugly ternary to extract points from value parameter
		const points =
			typeof value === "number"
				? value
				: await getPoints(value, interaction.guild.id);

		// Handle single vs multiple GuildMembers
		if (target instanceof Collection) {
			return this.giveToManyHandler(points, target, interaction);
		}

		return this.giveHandler(points, target, interaction);
	}

	private async giveToManyHandler(
		addedPoints: number,
		targets: Collection<string, GuildMember>,
		interaction: BaseInteraction,
	) {
		if (!interaction.guild) return [getString("errors", "noGuild")];
		const response: string[] = [];

		const user_ids = Array.from(targets.keys());
		const res = await Requests.givePointsToMultiple(interaction.guild.id, {
			user_id: user_ids,
			points: { type: "custom", amount: addedPoints },
		});

		if (res.error) {
			return [`Error giving points: ${res.message}`];
		}

		const givenTo = new Map<string, boolean>();
		targets.forEach((_, k) => {
			givenTo.set(k, false);
		});

		for (const u of res.data) {
			const newPoints = u.points;
			const member = targets.get(u.user_id);

			if (!member)
				return [getString("errors", "couldntGetUser", { userId: u.user_id })];

			givenTo.set(u.user_id, true);
			response.push(
				getString("ranks", "pointsGranted", {
					username: member.displayName,
					pointsGiven: addedPoints,
					grantedBy: member.displayName,
					totalPoints: newPoints,
				}),
			);
			const newRank = await this.rankService.rankUpHandler(
				interaction,
				member,
				newPoints - addedPoints,
				newPoints,
			);

			if (!newRank) continue;

			// Concatenate level up message to response if user leveled up
			const newRankIcon = this.rankService.getIcon(newRank);
			response.push(
				getString("ranks", "levelUpMessage", {
					username: member.displayName,
					icon: newRankIcon,
					rankName: newRank,
				}),
			);
		}

		givenTo.forEach((v, k) => {
			if (v) return;
			const member = targets.get(k);
			if (!member) return;

			response.push();
		});

		return response;
	}

	private async giveHandler(
		addedPoints: number,
		target: GuildMember,
		interaction: BaseInteraction,
	) {
		if (!interaction.guild) return getString("errors", "noGuild");

		const res = await Requests.givePoints(interaction.guild.id, {
			user_id: target.id,
			points: { type: "custom", amount: addedPoints },
		});

		if (res.status === 404) {
			return getString("accounts", "notActivated", {
				username: target.displayName,
			});
		}

		if (res.error) {
			return getString("errors", "givingPoints");
		}

		if (!res.data) {
			return getString("errors", "internalError", {
				username: target.displayName,
			});
		}

		const newPoints = res.data.points;

		const response: string[] = [];
		const member = interaction.member as GuildMember;

		response.push(
			getString("ranks", "pointsGranted", {
				username: target.displayName,
				pointsGiven: addedPoints,
				grantedBy: member.displayName,
				totalPoints: newPoints,
			}),
		);
		const newRank = await this.rankService.rankUpHandler(
			interaction,
			target,
			newPoints - addedPoints,
			newPoints,
		);

		if (!newRank) return response.join("\n");

		// Concatenate level up message to response if user leveled up
		const newRankIcon = this.rankService.getIcon(newRank);
		response.push(
			getString("ranks", "levelUpMessage", {
				username: target.displayName,
				icon: newRankIcon,
				rankName: newRank,
			}),
		);

		return response.join("\n");
	}
}
