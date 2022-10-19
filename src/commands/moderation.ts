import { Discord, Slash, SlashOption, SlashGroup } from 'discordx';
import {
	CommandInteraction,
	User,
	EmbedBuilder,
	GuildMember,
	ApplicationCommandOptionType,
} from 'discord.js';
import { Pagination } from '@discordx/pagination';
import updateUserPoints from '../data/database/updateUserPoints.js';
import IsAdmin from '../utility/isAdmin.js';
import getLeaderboard from '../data/database/getLeaderboard.js';
import setPointMultiplier from '../data/database/setPointMultiplier.js';
import { rankUpHandler } from '../data/roleHandling.js';

@Discord()
@SlashGroup({ name: 'moderation', description: 'Moderation related commands' })
@SlashGroup('moderation')
class Moderation {
	@Slash({ name: 'give', description: 'Give points to a user' })
	give(
		@SlashOption({
			name: 'username',
			description: '@User tag to give points to',
			required: true,
			type: ApplicationCommandOptionType.User,
		})
		@SlashOption({
			name: 'amount',
			description: 'Amount of points to give',
			required: true,
			type: ApplicationCommandOptionType.Number,
		})
		channel: GuildMember,
		points: number,
		interaction: CommandInteraction
	) {
		if (!IsAdmin(Number(interaction.member?.permissions))) return;

		let result = updateUserPoints(
			interaction.guildId!,
			// @ts-ignore
			channel.user.id,
			points
		);

		let response = 'Error giving points';
		result
			.then((res) => {
				if (Number.isInteger(res)) {
					// @ts-ignore
					response = `✔️ ${channel.user} was granted ${points} points by ${interaction.member} and now has a total of ${res} points.`;
					rankUpHandler(interaction, channel, res - points, res);
				}
				if (res == false) {
					// @ts-ignore
					response = `❌ ${channel.user} Is not an activated user.`;
				}
			})
			.catch((err) => {
				console.log(err);
			})
			.finally(() => {
				interaction.reply(response);
			});
	}
	// @Slash('leaderboard')
	// leaderboard(interaction: CommandInteraction) {
	// 	let result = getLeaderboard(
	// 		interaction.guildId!,
	// 	);
	// 	if (!IsAdmin(Number(interaction.member?.permissions))) return;

	// 	let botIconUrl = interaction.client.user?.avatarURL() ?? '';

	// 	const embedMaker = (): EmbedBuilder => {
	// 		return new EmbedBuilder()
	// 			.setTitle('Tectonic Leaderboard')
	// 			.setAuthor({
	// 				name: 'Tectonic Bot',
	// 				url: 'https://github.com/Miconen/tectonic-bot',
	// 				iconURL: botIconUrl,
	// 			})
	// 			.setColor('#0099ff')
	// 			.setTimestamp();
	// 	};

	// 	result
	// 		.then((res) => {
	// 			console.log(res);

	// 			let pages: any = [];
	// 			const pageMaker = (i: number) => {
	// 				let fields = res.slice(i, i + 10);

	// 				console.log(fields);
	// 				return {
	// 					embeds: [
	// 						embedMaker()
	// 							.setFooter({
	// 								text: `Page ${i + 1} (${i + 1}-${i + 10}) - /rsn set if you're not on the list.`,
	// 							})
	// 							.addFields(
	// 								// -1 cause dealing with array indexes starting at 0
	// 								...fields
	// 							),
	// 					],
	// 				};
	// 			};
	// 			for (let i = 0; i <= res.length; i++) {
	// 				if (i % 10 == 0) pages.push(pageMaker(i));
	// 			}

	// 			new Pagination(interaction, [...pages]).send();
	// 		})
	// 		.catch((err) => {
	// 			console.log(err);

	// 			interaction.reply('Error getting leaderboard');
	// 		});
	// }
	@Slash({
		name: 'setmultiplier',
		description: 'Set a server vide point multiplier',
	})
	setmultiplier(
		@SlashOption({
			name: 'multiplier',
			description: 'Number that all points given will get multiplied by',
			required: true,
			type: ApplicationCommandOptionType.Number,
		})
		multiplier: number,
		interaction: CommandInteraction
	) {
		if (!IsAdmin(Number(interaction.member?.permissions))) return;

		let response = 'Something went wrong...';

		let result = setPointMultiplier(multiplier, interaction.guild!.id);

		result
			.then((res: any) => {
				response = 'Updated server point multiplier';
			})
			.catch((err: any) => {
				console.log(err);
			})
			.finally(() => {
				interaction.reply(response);
			});
	}
}
