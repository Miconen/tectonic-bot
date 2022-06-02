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
		console.log(channel.user);

		interaction.reply(
			// @ts-ignore channel.user doesn't have type delcarations from discord.ts
			// so we have to use @ts-ignore to tell typescript to ignore the error
			`${channel.user} has been activated by ${interaction.member}`
		);

		// @ts-ignore channel.user doesn't have type delcarations from discord.ts
		// so we have to use @ts-ignore to tell typescript to ignore the error
		newUser(interaction.guildId!, channel.user.id);
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

		interaction.reply(
			// @ts-ignore channel.user doesn't have type delcarations from discord.ts
			// so we have to use @ts-ignore to tell typescript to ignore the error
			`${channel.user} has been deactivated by ${interaction.member}, this command currently can't tell if a user existed or not.`
		);

		// @ts-ignore channel.user doesn't have type delcarations from discord.ts
		// so we have to use @ts-ignore to tell typescript to ignore the error
		removeUser(interaction.guildId!, channel.user.id);
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
		console.log("result: ",result);

		return result;
	};
		console.log(getUserPoints(channel,interaction));
		interaction.reply(`${getUserPoints(channel,interaction)} points`);

	}

	@Slash('checkstatus')
	Checkstatus(
		@SlashOption('username', { description: '@User tag to check' })
		channel: User,
		interaction: CommandInteraction
	) {
		if (!isValid(interaction, channel)) return;

		let result = false;
		const callback = (resultBoolean: boolean) => {
			result = resultBoolean;

			if (!result) {
				interaction.reply(
					// @ts-ignore channel.user doesn't have type delcarations from discord.ts
					// so we have to use @ts-ignore to tell typescript to ignore the error
					`❌ ${channel.user} Is not an activated user.`
				);
				return;
			}
			interaction.reply(
				// @ts-ignore channel.user doesn't have type delcarations from discord.ts
				// so we have to use @ts-ignore to tell typescript to ignore the error
				`✔️ ${channel.user} is an activated user.`
			);
		};

		checkIfActivated(
			interaction.guildId!,
			// @ts-ignore channel.user doesn't have type delcarations from discord.ts
			// so we have to use @ts-ignore to tell typescript to ignore the error
			channel.user.id,
			callback
		);
	}
}
