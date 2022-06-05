import { Discord, Slash, SlashOption, SlashGroup } from 'discordx';
import { CommandInteraction, User } from 'discord.js';
import getPoints from '../data/database/getPoints.js';
import updateUserPoints from '../data/database/updateUserPoints.js';

@Discord()
@SlashGroup({ name: 'points', description: 'Points related commands' })
@SlashGroup('points')
class Points {
	@Slash('lookup')
	lookup(
		@SlashOption('username')
		channel: User,
		interaction: CommandInteraction
	) {
		let result = getPoints(
			interaction.guildId!,
			// @ts-ignore channel.user doesn't have type delcarations from discord.ts
			// so we have to use @ts-ignore to tell typescript to ignore the error
			channel.user.id
		);

		result
			.then((points) => {
				interaction.reply(`${points} points`);
			})
			.catch((err) => {
				interaction.reply('Error getting points');
			});
	}
	@Slash('give')
	give(
		@SlashOption('username')
		channel: User,
		@SlashOption('points', { description: 'Points to give' })
		points: number,
		interaction: CommandInteraction
	) {
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
				}
				if (res == false) {
					// @ts-ignore channel.user doesn't have type delcarations from discord.ts
					// so we have to use @ts-ignore to tell typescript to ignore the error
					response = `❌ ${interaction.message.interaction?.user} Is not an activated user.`;
				}
			})
			.catch((err) => {
				console.log(err);
			})
			.finally(() => {
				interaction.reply(response);
			});
	}
}
