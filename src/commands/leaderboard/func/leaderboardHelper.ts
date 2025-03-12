import { type CommandInteraction, EmbedBuilder } from "discord.js";
import { Pagination } from "@discordx/pagination";
import type IRankService from "@utils/rankUtils/IRankService";
import { Requests } from "@requests/main.js";

import { container } from "tsyringe";
import { replyHandler } from "@utils/replyHandler";

interface LeaderboardUser {
	name: string;
	value: string;
}

const leaderboardHelper = async (interaction: CommandInteraction) => {
	const rankService = container.resolve<IRankService>("RankService");

	if (!interaction.guild) return;
	await interaction.deferReply();

	const lb = await Requests.getLeaderboard(interaction.guild.id);
	if (lb.error)
		return replyHandler("Error outputting leaderboard", interaction);
	const users = lb.data;
	if (!users || users.length === 0)
		return replyHandler("No activated users for leaderboard", interaction);

	const userIds = users.map((user) => user.user_id);
	const usersData = await interaction.guild.members.fetch({ user: userIds });
	if (!usersData) return;

	const leaderboard: LeaderboardUser[] = [];
	let serverRank = 0;
	for (const user of users) {
		const userData = usersData.get(user.user_id);
		if (!userData) continue;

		const rank = rankService.getRankByPoints(user.points);
		serverRank++;

		leaderboard.push({
			name: `#${serverRank} **${userData.nickname ?? userData.displayName}** (${user.rsns.map((rsn) => rsn.rsn).join(" | ")})`,
			value: `${rankService.getIcon(rank)} ${user.points} points | Accounts: ${user.rsns.length}`,
		});
	}

	const botIconUrl = interaction.client.user?.avatarURL() ?? "";

	const embedMaker = (): EmbedBuilder => {
		return new EmbedBuilder()
			.setTitle("Tectonic Leaderboard")
			.setAuthor({
				name: "Tectonic Bot",
				url: "https://github.com/Miconen/tectonic-bot",
				iconURL: botIconUrl,
			})
			.setColor("#0099ff")
			.setTimestamp();
	};

	const pages = [];
	function pageMaker(i: number) {
		const fields = leaderboard.slice(i, i + 10);

		return {
			embeds: [
				embedMaker()
					.setFooter({
						text: `Page ${(i % 9) + 1} (${i + 1}-${i + 10})`,
					})
					.addFields(...fields),
			],
		};
	}
	for (let i = 0; i <= leaderboard.length; i++) {
		if (i % 10 === 0) pages.push(pageMaker(i));
	}

	await new Pagination(interaction, [...pages]).send();
};

export default leaderboardHelper;
