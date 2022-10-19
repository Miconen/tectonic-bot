import { Discord, Slash, SlashOption } from 'discordx';
import {
	ApplicationCommandOptionType,
	CommandInteraction,
	GuildMember,
	User,
} from 'discord.js';
import IsAdmin from '../utility/isAdmin.js';
import newUser from '../data/database/newUser.js';
import removeUser from '../data/database/removeUser.js';
import checkIfActivated from '../data/database/checkIfActivated.js';
import { addRole, removeAllRoles } from '../data/roleHandling.js';

const isValid = (interaction: CommandInteraction) => {
	if (!IsAdmin(Number(interaction.member?.permissions))) {
		interaction.reply('❌ Lacking permissions for this command.');
		return false;
	}
	// TODO: Check if user is a bot

	return true;
};

@Discord()
class Activation {
	@Slash({
		name: 'activate',
		description:
			'Used for activating new guild members and giving access to rank points',
	})
	async Activate(
		@SlashOption({
			name: 'username',
			description: '@User tag to activate',
			required: true,
			type: ApplicationCommandOptionType.User,
		})
		user: GuildMember,
		interaction: CommandInteraction
	) {
		if (!isValid(interaction)) return;

		// @ts-ignore user.user doesn't have type delcarations from discord.ts
		// so we have to use @ts-ignore to tell typescript to ignore the error
		let result = newUser(interaction.guildId!, user.user.id);

		let response = '';
		result
			.then((res: any) => {
				if (res) {
					// @ts-ignore user.user doesn't have type delcarations from discord.ts
					// so we have to use @ts-ignore to tell typescript to ignore the error
					response = `${user.user} has been activated by ${interaction.member}.`;
					// Set default role
					addRole(interaction, user, 'jade');
				}
				if (!res) {
					// @ts-ignore user.user doesn't have type delcarations from discord.ts
					// so we have to use @ts-ignore to tell typescript to ignore the error
					response = `❌ ${user.user} is already activated.`;
				}
			})
			.catch((err) => {
				response = 'Error checking if user is activated';
			})
			.finally(() => {
				interaction.reply(response);
			});
	}

	@Slash({
		name: 'deactivate',
		description:
			'Deactivate and remove all points/data entries associated with a user',
	})
	async Deactivate(
		@SlashOption({
			name: 'username',
			description:
				'@User tag to deactivate, WARNING USERS POINTS WILL BE DELETED',
			required: true,
			type: ApplicationCommandOptionType.User,
		})
		user: GuildMember,
		interaction: CommandInteraction
	) {
		if (!isValid(interaction)) return;

		// @ts-ignore user.user doesn't have type delcarations from discord.ts
		// so we have to use @ts-ignore to tell typescript to ignore the error
		let result = removeUser(interaction.guildId!, user.user.id);

		let response = '';
		result
			.then((res) => {
				if (res) {
					// @ts-ignore user.user doesn't have type delcarations from discord.ts
					// so we have to use @ts-ignore to tell typescript to ignore the error
					response = `${user.user} has been deactivated by ${interaction.member}, this command currently can't tell if a user existed or not.`;
					// Remove all rank roles
					removeAllRoles(interaction, user);
				}
				if (!res) {
					// @ts-ignore user.user doesn't have type delcarations from discord.ts
					// so we have to use @ts-ignore to tell typescript to ignore the error
					response = `❌ ${user.user} is not an activated user.`;
				}
			})
			.catch((err) => {
				response = 'Error checking if user is activated';
			})
			.finally(() => {
				interaction.reply(response);
			});
	}

	@Slash({
		name: 'checkstatus',
		description: 'Checks if a user is activated or not',
	})
	async Checkstatus(
		@SlashOption({
			name: 'username',
			description: '@User tag to check',
			required: true,
			type: ApplicationCommandOptionType.User,
		})
		channel: User,
		interaction: CommandInteraction
	) {
		if (!isValid(interaction)) return;

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
