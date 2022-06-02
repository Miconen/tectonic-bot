import { Discord, Slash, SlashChoice, SlashOption } from 'discordx';
import type { CommandInteraction, User } from 'discord.js';
// import getPoints from '../data/database/getPoints.js';

// const getUserPoints = (channel: User, interaction: CommandInteraction) => {
// 	let result = 0;
// 	const callback = (resultNumber: number) => {
// 		result = resultNumber;
// 	};

// 	getPoints(
// 		interaction.guildId!,
// 		// @ts-ignore channel.user doesn't have type delcarations from discord.ts
// 		// so we have to use @ts-ignore to tell typescript to ignore the error
// 		channel.user.id,
// 		callback
// 	);
// 	return result;
// };

@Discord()
class PointCommands {}
