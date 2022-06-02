import { Discord, Slash, SlashOption } from 'discordx';
import { CommandInteraction } from 'discord.js';
import IsAdmin from '../utility/isAdmin.js';
import User from '../data/User.js';
import newUser from '../data/database/newUser.js';
import removeUser from '../data/database/removeUser.js';

const validateInput = (interaction: CommandInteraction) => {
	if (!IsAdmin(Number(interaction.member?.permissions))) {
		interaction.reply('❌ Lacking permissions for this command.');
		return false;
	}

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
		if (!validateInput(interaction)) return;

		interaction.reply(
			// @ts-ignore channel.user doesn't have type delcarations from discord.ts
			// so we have to use @ts-ignore to tell typescript to ignore the error
			`${channel.user} has been activated by ${interaction.member}`
		);

		// @ts-ignore channel.user doesn't have type delcarations from discord.ts
		// so we have to use @ts-ignore to tell typescript to ignore the error
		newUser(channel.user.id, interaction.guildId!);
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
		if (!validateInput(interaction)) return;

		interaction.reply(
			// @ts-ignore channel.user doesn't have type delcarations from discord.ts
			// so we have to use @ts-ignore to tell typescript to ignore the error
			`${channel.user} has been deactivated by ${interaction.member}, this command currently can't tell if a user existed or not.`
		);

		// @ts-ignore channel.user doesn't have type delcarations from discord.ts
		// so we have to use @ts-ignore to tell typescript to ignore the error
		removeUser(channel.user.id, interaction.guildId!);
	}
}
