import { Requests } from "@requests/main.js";
import type {
	CustomPoints,
	PointsParam,
	PresetPoints,
} from "@typings/requests.js";
import { getString } from "@utils/stringRepo.js";
import type {
	BaseInteraction,
	ButtonInteraction,
	CommandInteraction,
	GuildMember,
} from "discord.js";
import { Collection } from "discord.js";
import { inject, injectable, singleton } from "tsyringe";
import type IRankService from "../rankUtils/IRankService.js";
import type IPointService from "./IPointService.js";

@singleton()
@injectable()
export class PointService implements IPointService {
	constructor(@inject("RankService") private rankService: IRankService) { }

	async givePoints(
		value: string | number,
		target: GuildMember | Collection<string, GuildMember>,
		interaction: CommandInteraction | ButtonInteraction,
	) {
		if (!interaction.guild) return getString("errors", "noGuild");

		const member = await interaction.guild.members.fetch({
			user: interaction.user.id,
		});

		const user_id =
			target instanceof Collection
				? target.map((member) => member.id)
				: target.id;

		const points =
			typeof value === "number"
				? ({ type: "custom" as const, amount: value } as CustomPoints)
				: ({ type: "preset" as const, event: value } as PresetPoints);

		const param: PointsParam = { user_id, points };

		// Handle single vs multiple GuildMembers
		if (target instanceof Collection) {
			return this.giveToManyHandler(param, target, member, interaction);
		}

		return this.giveHandler(param, target, member, interaction);
	}

	private async giveToManyHandler(
		param: PointsParam,
		targets: Collection<string, GuildMember>,
		invoker: GuildMember,
		interaction: CommandInteraction | ButtonInteraction,
	) {
		if (!interaction.guild) return [getString("errors", "noGuild")];
		if (!interaction.member) return [getString("errors", "noMember")];
		const response: string[] = [];

		const res = await Requests.givePointsToMultiple(
			interaction.guild.id,
			param,
		);

		if (res.error) {
			return [`Error giving points: ${res.message}`];
		}

		const givenTo = new Map<string, boolean>();
		targets.forEach((_, k) => {
			givenTo.set(k, false);
		});

		for (const u of res.data) {
			const member = targets.get(u.user_id);

			if (!member)
				return [getString("errors", "couldntGetUser", { userId: u.user_id })];

			givenTo.set(u.user_id, true);
			response.push(
				getString("ranks", "pointsGranted", {
					username: member.displayName,
					pointsGiven: u.given_points,
					grantedBy: invoker.displayName,
					totalPoints: u.points,
				}),
			);
			const newRank = await this.rankService.rankUpHandler(
				interaction,
				member,
				u.points - u.given_points,
				u.points,
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
		param: PointsParam,
		target: GuildMember,
		invoker: GuildMember,
		interaction: BaseInteraction,
	) {
		if (!interaction.guild) return getString("errors", "noGuild");

		const res = await Requests.givePoints(interaction.guild.id, param);

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

		const response: string[] = [];
		response.push(
			getString("ranks", "pointsGranted", {
				username: target.displayName,
				pointsGiven: res.data.given_points,
				grantedBy: invoker.displayName,
				totalPoints: res.data.points,
			}),
		);
		const newRank = await this.rankService.rankUpHandler(
			interaction,
			target,
			res.data.points - res.data.given_points,
			res.data.points,
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
