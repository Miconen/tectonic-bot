import { Discord, Slash, SlashOption } from 'discordx';
import { CommandInteraction, SystemChannelFlags, User } from 'discord.js';
import IsAdmin from '../utility/isAdmin.js';
import newUser from '../data/database/newUser.js';
import removeUser from '../data/database/removeUser.js';
import checkIfActivated from '../data/database/checkIfActivated.js';
import getPoints from '../data/database/getPoints.js';
import { waitForDebugger } from 'inspector';

const isValid = (interaction: CommandInteraction, channel: User) => {
	if (!IsAdmin(Number(interaction.member?.permissions))) {
		interaction.reply('❌ Lacking permissions for this command.');
		return false;
	}
	// TODO: Check if user is a bot

	return true;
};

@Discord()
class Activation {
	@Slash('activate')
	Activate(
		@SlashOption('username', { description: '@User tag to activate' })
		channel: User,
		interaction: CommandInteraction
	) {
		if (!isValid(interaction, channel)) return;

		// @ts-ignore channel.user doesn't have type delcarations from discord.ts
		// so we have to use @ts-ignore to tell typescript to ignore the error
		let result = newUser(interaction.guildId!, channel.user.id);

		let response = '';
		result
			.then((res: any) => {
				console.log(res);
				if (res) {
					// @ts-ignore channel.user doesn't have type delcarations from discord.ts
					// so we have to use @ts-ignore to tell typescript to ignore the error
					response = `${channel.user} has been activated by ${interaction.member}.`;
				}
				if (!res) {
					// @ts-ignore channel.user doesn't have type delcarations from discord.ts
					// so we have to use @ts-ignore to tell typescript to ignore the error
					response = `❌ ${channel.user} is already activated.`;
				}
			})
			.catch((err) => {
				response = 'Error checking if user is activated';
			})
			.finally(() => {
				interaction.reply(response);
			});
	}

	@Slash('deactivate')
	Deactivate(
		@SlashOption('username', {
			description:
				'@User tag to deactivate, WARNING USERS POINTS WILL BE DELETED',
		})
		channel: User,
		interaction: CommandInteraction
	) {
		if (!isValid(interaction, channel)) return;

		// @ts-ignore channel.user doesn't have type delcarations from discord.ts
		// so we have to use @ts-ignore to tell typescript to ignore the error
		let result = removeUser(interaction.guildId!, channel.user.id);

		let response = '';
		result
			.then((res) => {
				if (res) {
					// @ts-ignore channel.user doesn't have type delcarations from discord.ts
					// so we have to use @ts-ignore to tell typescript to ignore the error
					response = `${channel.user} has been deactivated by ${interaction.member}, this command currently can't tell if a user existed or not.`;
				}
				if (!res) {
					// @ts-ignore channel.user doesn't have type delcarations from discord.ts
					// so we have to use @ts-ignore to tell typescript to ignore the error
					response = `❌ ${channel.user} is not an activated user.`;
				}
			})
			.catch((err) => {
				response = 'Error checking if user is activated';
			})
			.finally(() => {
				interaction.reply(response);
			});
	}

	@Slash('points')
	points(
		// DO NOT CHANGE ANY OF THIS OR RISK DEBUGGING FOR 3 HOURS WORTH OF SHIT UNEXPLAINABLE BUGS
		@SlashOption('username')
		channel: User,
		interaction: CommandInteraction
	) {
		// let points = getUserPoints(channel, interaction);
		//TODO: Get points from database with database/getPoints.ts
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

	@Slash('checkstatus')
	Checkstatus(
		@SlashOption('username', { description: '@User tag to check' })
		channel: User,
		interaction: CommandInteraction
	) {
		if (!isValid(interaction, channel)) return;

		let result = checkIfActivated(
			interaction.guildId!,
			// @ts-ignore channel.user doesn't have type delcarations from discord.ts
			// so we have to use @ts-ignore to tell typescript to ignore the error
			channel.user.id
		);

		let response = '';
		result
			.then((status) => {
				if (status) {
					// @ts-ignore channel.user doesn't have type delcarations from discord.ts
					// so we have to use @ts-ignore to tell typescript to ignore the error
					response = `✔️ ${channel.user} is an activated user.`;
				}
				if (!status) {
					// @ts-ignore channel.user doesn't have type delcarations from discord.ts
					// so we have to use @ts-ignore to tell typescript to ignore the error
					response = `❌ ${channel.user} is not an activated user.`;
				}
			})
			.catch((err) => {
				response = 'Error checking if user is activated';
			})
			.finally(() => {
				interaction.reply(response);
			});
	}
}
