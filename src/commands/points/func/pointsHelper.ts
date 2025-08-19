import type { CommandInteraction, GuildMember } from "discord.js";
import type IRankService from "@utils/rankUtils/IRankService";
import { Requests } from "@requests/main.js";

import { container } from "tsyringe";
import { getString } from "@utils/stringRepo";
import { replyHandler } from "@utils/replyHandler";

const pointsHelper = async (
	user: GuildMember | null,
	interaction: CommandInteraction,
) => {
	const rankService = container.resolve<IRankService>("RankService");
	if (!interaction.guild)
		return await replyHandler(getString("errors", "noGuild"), interaction);

	const targetUser = user?.user?.id ?? interaction.user.id ?? "0";
	const targetUserName =
		user?.displayName ??
		(interaction.member as GuildMember).displayName ??
		"???";

	const res = await Requests.getUser(interaction.guild.id, {
		type: "user_id",
		user_id: targetUser,
	});
	if (res.error) {
		return await replyHandler(
			getString("accounts", "notActivated", { username: targetUserName }),
			interaction,
		);
	}

	if (!res.data) {
		return getString("accounts", "notActivated", { username: targetUserName });
	}

	const points = res.data.points;

	const nextRankUntil = rankService.pointsToNextRank(points);
	const nextRankIcon = rankService.getIcon(
		rankService.getRankByPoints(points + nextRankUntil),
	);

	let response = `${rankService.getIcon(
		rankService.getRankByPoints(points),
	)} **${targetUserName}** has: ${points} points`;
	if (rankService.getRankByPoints(points) !== "zenyte")
		response += `\n${nextRankIcon} Points to next level: ${nextRankUntil}`;

	return await replyHandler(response, interaction);
};

export default pointsHelper;
