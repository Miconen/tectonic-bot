import { Discord, Slash, SlashOption } from 'discordx';
import {
    ApplicationCommandOptionType,
    CommandInteraction, EmbedBuilder,
    GuildMember,
} from 'discord.js';
import IsAdmin from "../utility/isAdmin.js";
import getLeaderboard from '../data/database/getLeaderboard.js';
import {Pagination} from "@discordx/pagination";
import {getRankByPoints} from "../data/roleHandling";
import {roleIcon} from "../data/iconData";

@Discord()
class Leaderboard {
    //     let hana = await interaction.guild?.members.fetch("161226317570899968");
    //     await interaction.reply(hana?.displayName ?? "undefined");
    @Slash({name: "leaderboard", description: "Check the top 50 leaderboard"})
    async leaderboard(interaction: CommandInteraction) {
		if (!interaction.guildId) return;
    	if (!IsAdmin(Number(interaction.member?.permissions))) return;

		let users = await getLeaderboard(
			interaction.guildId,
		);

		interface ILeaderboardUser {
			name: string;
			value: string;
		}

		let leaderboard: ILeaderboardUser[] = [];
		for (let user of users) {
			let userData = await interaction.guild?.members.fetch(user.user_id.toString())
			if (!userData) continue;

			let rank = getRankByPoints(user.points);

			leaderboard.push({
				name: `${roleIcon.get(rank)} **${userData.displayName}**`,
				value: `${user.points} points`,
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

		let response: string;

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
							// -1 cause dealing with array indexes starting at 0
							...fields
						),
				],
			};
		};
		for (let i = 0; i <= leaderboard.length; i++) {
			if (i % 10 == 0) pages.push(pageMaker(i));
		}

		await new Pagination(interaction, [...pages]).send();
        response = 'Error getting leaderboard';
        await interaction.reply(response);
    }
}