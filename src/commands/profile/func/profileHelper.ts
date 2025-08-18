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
	if (!interaction.guild) return "❌ Critical error determining guild.";
	const guildId = interaction.guild.id;

	const rankService = container.resolve<IRankService>("RankService");

	let target = member;
	let query: UserParam | undefined;
	let errorMsg = "❌ Error fetching user data.";

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
		errorMsg = `❌ **${rsn}** is not bound to a known member.`;
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

	let response: string;
	response = `# ${currentRankIcon} **${target.displayName}**`;
	response += `\nCurrent points: ${points}${currentRankIcon}`;
	if (currentRank !== "wrath") {
		response += `\nPoints to next level: ${nextRankUntil}${nextRankIcon}`;
	}
	if (user.rsns.length) {
		response += "\n# Accounts";
		for (const account of user.rsns) {
			response += `\n\`${account.rsn}\``;
		}
	} else {
		response +=
			"\n`Link your OSRS account to be eligible for event rank points`";
	}
	if (user.times.length) {
		response += "\n# Clan PBs";
		for (const pb of user.times) {
			response += `\n\`${pb.category} | ${pb.display_name}\` - \`${TimeConverter.ticksToTime(pb.time)} (${pb.time} ticks)\``;
		}
	}
	// TODO: Also check if user has any events where placed below position_cutoff
	if (user.events.length) {
		response += "\n# Event placements";
		for (const event of user.events) {
			response += `\n[${event.name}](https://wiseoldman.net/competitions/${event.wom_id}) - Placement: #${event.placement}`;
		}
	}

	if (user.achievements.length) {
		response += "\n# Achievements";
		for (const achievement of user.achievements) {
			response += `\n${achievement.discord_icon} - **${achievement.name}**`;
		}
	}

	return response;
};

export default pointsHelper;
