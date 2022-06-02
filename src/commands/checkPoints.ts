import { Discord, Slash, SlashOption } from 'discordx';
import type { CommandInteraction, User } from 'discord.js';
import getPoints from '../data/database/getPoints.js';

const getUserPoints = (channel: User, interaction: CommandInteraction) => {
	let result = 0;
	const callback = (resultNumber: number) => {
		result = resultNumber;
	};

	getPoints(
		interaction.guildId!,
		// @ts-ignore channel.user doesn't have type delcarations from discord.ts
		// so we have to use @ts-ignore to tell typescript to ignore the error
		channel.user.id,
		callback
	);
	return result;
};

@Discord()
class PointCheck {
	@Slash('yeet')
	points(
		@SlashOption('username', { description: '@User tag to get points' })
		name: 'yeet',
		channel: User,
		interaction: CommandInteraction
	) {
		interaction.reply('yee');
	}
}
