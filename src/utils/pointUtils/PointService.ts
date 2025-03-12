import { Requests } from "@requests/main.js";
import { getString } from "@utils/stringRepo.js";
import type { BaseInteraction, Collection, GuildMember } from "discord.js";
import { inject, injectable, singleton } from "tsyringe";
import type IRankService from "../rankUtils/IRankService.js";
import type IPointService from "./IPointService.js";

@singleton()
@injectable()
export class PointService implements IPointService {
	readonly pointRewards: Map<string, number>;
	private pointMultiplierCache: Map<string, number>;

	constructor(@inject("RankService") private rankService: IRankService) {
		this.pointRewards = new Map([
			["event_participation", 5],
			["event_hosting", 10],
			["forum_bump", 5],
			["learner_half", 5],
			["learner_full", 10],
			["split_low", 10],
			["split_medium", 20],
			["split_high", 30],
		]);

		this.pointMultiplierCache = new Map();
	}

	async pointsHandler(points: number, guild_id: string) {
		// Check if the multiplier is already cached
		if (this.pointMultiplierCache.has(guild_id)) {
			const cachedMultiplier = this.pointMultiplierCache.get(guild_id);
			if (!cachedMultiplier) return points;
			return points * cachedMultiplier;
		}

		const res = await Requests.getGuild(guild_id);
		if (res.error) return points;
		const multi = res.data.multiplier;
		if (!multi) return points;
		if (Number.isNaN(multi) || multi === 0) return points;

		this.pointMultiplierCache.set(guild_id, multi);
		return points * multi;
	}

	async givePointsToMultiple(
		addedPoints: number,
		users: Collection<string, GuildMember>,
		interaction: BaseInteraction,
		extraPoints?: { [key: string]: number },
	) {
		if (!interaction.guild) return ["Error fetching guild ID"];
		const response: string[] = [];

		const user_ids = Array.from(users.keys());
		const res = await Requests.givePointsToMultiple(interaction.guild.id, {
			user_id: user_ids,
			points: { type: "custom", amount: addedPoints },
		});

		if (res.error) {
			return [`Error giving points: ${res.message}`];
		}

		const givenTo = new Map<string, boolean>();
		users.forEach((_, k) => {
			givenTo.set(k, false);
		});

		for (const u of res.data) {
			const newPoints = u.points;
			const member = users.get(u.user_id);

			if (!member) return [`Couldn't get user for ID: ${u.user_id}`];

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
			const member = users.get(k);
			if (!member) return;

			response.push();
		});

		return response;
	}

	async givePoints(
		addedPoints: number,
		user: GuildMember,
		interaction: BaseInteraction,
	) {
		if (!interaction.guild) return getString("errors", "noGuild");

		const member = interaction.member as GuildMember;

		const res = await Requests.givePoints(interaction.guild.id, {
			user_id: user.id,
			points: { type: "custom", amount: addedPoints },
		});

		if (res.error) {
			if (res.status === 404) {
				return getString("accounts", "notActivated", {
					username: member.displayName,
				});
			}

			return getString("errors", "givingPoints");
		}

		if (!res.data) {
			return getString("accounts", "notActivated", {
				username: member.displayName,
			});
		}

		if (res.status === 200) {
			const newPoints = res.data.points;

			const response: string[] = [];

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
				user,
				newPoints - addedPoints,
				newPoints,
			);

			if (!newRank) return response.join("\n");

			// Concatenate level up message to response if user leveled up
			const newRankIcon = this.rankService.getIcon(newRank);
			response.push(
				getString("ranks", "levelUpMessage", {
					username: member.displayName,
					icon: newRankIcon,
					rankName: newRank,
				}),
			);

			return response.join("\n");
		}

		return getString("errors", "givingPoints");
	}
}
