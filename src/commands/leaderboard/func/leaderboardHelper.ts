import { Pagination } from "@discordx/pagination";
import { Requests } from "@requests/main.js";
import { type CommandInteraction, EmbedBuilder } from "discord.js";

import { replyHandler } from "@utils/replyHandler";
import { replyApiError } from "@utils/replyApiError";
import { getRanks } from "@utils/ranks/guildRanks";
import { tierForPoints } from "@utils/ranks/tierMath";

interface LeaderboardUser {
	name: string;
	value: string;
}

async function leaderboardHelper(interaction: CommandInteraction<"cached">) {
	const lb = await Requests.getLeaderboard(interaction.guild.id);
	if (lb.error) {
		return await replyApiError(lb, interaction, {
			category: "accountErrors",
		});
	}
	const users = lb.data;
	if (!users || users.length === 0)
		return replyHandler("No activated users for leaderboard", interaction);

	// Fetch guild rank tiers for icon lookup
	const ranksRes = await Requests.getGuildRanks(interaction.guild.id);

	if (ranksRes.error) {
		return await replyApiError(ranksRes, interaction, {
			category: "rankErrors",
		});
	}

	const userIds = users.map((user) => user.user_id);
	const usersData = await interaction.guild.members.fetch({ user: userIds });
	if (!usersData) return;

	const leaderboard: LeaderboardUser[] = [];
	let serverRank = 0;
	for (const user of users) {
		const userData = usersData.get(user.user_id);
		if (!userData) continue;

		const ranks = await getRanks(interaction.guild.id);
		const rank = await tierForPoints(user.points, ranks);
		serverRank++;

		leaderboard.push({
			name: `#${serverRank} **${
				userData.nickname ?? userData.displayName
			}** (${user.rsns.map((rsn) => rsn.rsn).join(" | ")})`,
			value: `${rank?.icon ?? ""} ${user.points} points | Accounts: ${user.rsns.length}`,
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
						text: `Page ${i / 10 + 1} (${i + 1}-${i + 10})`,
					})
					.addFields(...fields),
			],
		};
	}
	for (let i = 0; i <= leaderboard.length; i++) {
		if (i % 10 === 0) pages.push(pageMaker(i));
	}

	await new Pagination(interaction, [...pages]).send();
}

export default leaderboardHelper;
