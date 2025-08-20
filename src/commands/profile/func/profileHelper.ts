import type { CommandInteraction, GuildMember } from "discord.js";
import type IRankService from "@utils/rankUtils/IRankService";
import { Requests } from "@requests/main.js";
import type { UserParam } from "@typings/requests.js";

import { container } from "tsyringe";
import TimeConverter from "@commands/pb/func/TimeConverter";
import { getString } from "@utils/stringRepo";

const pointsHelper = async (
	member: GuildMember | null,
	rsn: string | null,
	interaction: CommandInteraction,
) => {
	if (!interaction.guild) return getString("errors", "noGuild");
	const guildId = interaction.guild.id;

	const rankService = container.resolve<IRankService>("RankService");

	let target = member;
	let query: UserParam | undefined;
	let errorMsg = getString("profile", "criticalError");

	if (!target) {
		target = interaction.member as GuildMember;
	}

	// User wants to check self
	if (!rsn) {
		query = { type: "user_id", user_id: target.id };
		errorMsg = getString("accounts", "notActivated", {
			username: target.displayName,
		});
	}

	// Checks the database for an rns
	if (rsn) {
		query = { type: "rsn", rsn };
		errorMsg = getString("errors", "rsnNotBound", { rsn });
	}

	if (!query) {
		return errorMsg;
	}

	const res = await Requests.getUser(guildId, query);
	if (res.error) return errorMsg;
	if (!res.data) {
		return getString("accounts", "notActivated", {
			username: target.displayName,
		});
	}

	target = await interaction.guild.members.fetch(res.data.user_id);

	const user = res.data;
	const points = user.points;

	// Rank info and icons
	const nextRankUntil = rankService.pointsToNextRank(points);
	const nextRank = rankService.getRankByPoints(points + nextRankUntil);
	const nextRankIcon = rankService.getIcon(nextRank);
	const currentRank = rankService.getRankByPoints(points);
	const currentRankIcon = rankService.getIcon(currentRank);

	const lines: string[] = [];
	lines.push(
		getString("profile", "header", {
			rankIcon: currentRankIcon,
			username: target.displayName,
		}),
		getString("ranks", "rankInfoWithNext", {
			currentIcon: currentRankIcon,
			username: target.displayName,
			points,
			nextIcon: nextRankIcon,
			pointsToNext: nextRankUntil,
		}),
	);
	if (currentRank === "wrath") {
		lines.push(
			getString("ranks", "rankInfo", {
				icon: currentRankIcon,
				username: target.displayName,
				points,
			}),
		);
	}
	if (user.rsns.length) {
		lines.push(getString("profile", "accountsHeader"));
		for (const account of user.rsns) {
			lines.push(getString("profile", "accountEntry", { rsn: account.rsn }));
		}
	} else {
		lines.push(`\`${getString("accounts", "noLinkedAccounts")}\``);
	}
	console.log(user.times);
	if (user.times.length) {
		lines.push(getString("profile", "pbsHeader"));
		for (const pb of user.times) {
			lines.push(
				getString("profile", "pbEntry", {
					category: pb.category,
					displayName: pb.display_name,
					time: TimeConverter.ticksToTime(pb.time),
					ticks: pb.time,
				}),
			);
		}
	}
	// TODO: Also check if user has any events where placed below position_cutoff
	if (user.events.length) {
		lines.push(getString("profile", "eventsHeader"));
		for (const event of user.events) {
			// Skip events that are below the position cutoff
			if (event.postition_cutoff < event.placement) continue;

			lines.push(
				getString("profile", "eventEntry", {
					eventName: event.name,
					womId: event.wom_id,
					placement: event.placement,
				}),
			);
		}
	}

	if (user.achievements.length) {
		lines.push(getString("profile", "achievementsHeader"));
		for (const achievement of user.achievements) {
			lines.push(
				getString("profile", "achievementEntry", {
					icon: achievement.discord_icon,
					name: achievement.name,
				}),
			);
		}
	}

	return lines.join("\n");
};

export default pointsHelper;
