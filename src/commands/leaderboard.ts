import { Discord, Guard, Slash } from 'discordx';
import {
	ApplicationCommandOptionType,
	CommandInteraction, EmbedBuilder,
} from 'discord.js';
import IsAdmin from "../utility/isAdmin.js";
import getLeaderboard from '../database/getLeaderboard.js';
import { Pagination } from "@discordx/pagination";
import * as rankUtils from "../utility/rankUtils/index.js";
import { RateLimit, TIME_UNIT } from '@discordx/utilities';

@Discord()
class Leaderboard {
	@Slash({ name: "leaderboard", description: "Check the top 50 leaderboard" })
	@Guard(RateLimit(TIME_UNIT.seconds, 60))
	async leaderboard(interaction: CommandInteraction) {
		if (!interaction.guildId) return;
		if (!IsAdmin(Number(interaction.member?.permissions))) return;

		await interaction.deferReply();

		let users = await getLeaderboard(
			interaction.guildId,
		);
		let userIds = users.map(user => user.user_id);
		let usersData = await interaction.guild?.members.fetch({ user: userIds })
		if (!usersData) return;

		interface ILeaderboardUser {
			name: string;
			value: string;
		}

		let leaderboard: ILeaderboardUser[] = [];
		let serverRank = 0;
		for (let user of users) {
			let userData = usersData.get(user.user_id)
			if (!userData) continue;

			let rank = rankUtils.getRankByPoints(user.points);
			serverRank++;

			leaderboard.push({
				name: `#${serverRank} **${userData.displayName}**`,
				value: `${rankUtils.rankIcon.get(rank)} ${user.points} points`,
			});
		}

		let botIconUrl = interaction.client.user?.avatarURL() ?? '';

		const embedMaker = (): EmbedBuilder => {
			return new EmbedBuilder()
				.setTitle('Tectonic Leaderboard')
				.setAuthor({
					name: 'Tectonic Bot',
					url: 'https://github.com/Miconen/tectonic-bot',
					iconURL: botIconUrl,
				})
				.setColor('#0099ff')
				.setTimestamp();
		};

		let pages: any = [];
		const pageMaker = (i: number) => {
			let fields = leaderboard.slice(i, i + 10);

			return {
				embeds: [
					embedMaker()
						.setFooter({
							text: `Page ${i + 1} (${i + 1}-${i + 10})`,
						})
						.addFields(
							...fields
						),
				],
			};
		};
		for (let i = 0; i <= leaderboard.length; i++) {
			if (i % 10 == 0) pages.push(pageMaker(i));
		}

		await new Pagination(interaction, [...pages]).send();
	}
}