import { Discord, Slash, SlashOption, SlashGroup, SlashChoice } from 'discordx';
import { CommandInteraction, User } from 'discord.js';
import IsAdmin from '../utility/isAdmin.js';
import setRsn from '../data/database/setRsn.js';
import getRsn from '../data/database/getRsn.js';

@Discord()
@SlashGroup({ name: 'rsn', description: 'Runescape name related commands' })
@SlashGroup('rsn')
class RSN {
	@Slash('set')
	give(
		@SlashOption('username')
		channel: User,

		@SlashOption('rsname', { description: 'Users RSN' })
		rsname: string,

		@SlashChoice({ name: 'Hardcore Group Ironman', value: 'HCGIM' })
		@SlashChoice({ name: 'Group Ironman', value: 'GIM' })
		@SlashChoice({ name: 'Ultimate Ironman', value: 'UIM' })
		@SlashChoice({ name: 'Hardcore Ironman', value: 'HCIM' })
		@SlashChoice({ name: 'Ironman', value: 'IM' })
		@SlashChoice({ name: 'Main', value: 'MAIN' })
		@SlashOption('type', { description: 'Users account/ironman type'})
		type: string,

		interaction: CommandInteraction
	) {
		if (!IsAdmin(Number(interaction.member?.permissions))) return;

		let result = setRsn(
			interaction.guildId!,
			// @ts-ignore
			channel.user.id,
			rsname,
			type
		);

		let response = 'Error setting rsn, maybe the user is not activated?';
		result
			.then((res: any) => {
				console.log(res);
				if (res) {
					// @ts-ignore
					response = `✔️ RSN Has been set.`;
				}
			})
			.catch((err: any) => {
				console.log(err);
			})
			.finally(() => {
				interaction.reply(response);
			});
	}
	@Slash('lookup')
	setiron(
		@SlashOption('username')
		channel: User,
		interaction: CommandInteraction
	) {
		if (!IsAdmin(Number(interaction.member?.permissions))) return;

		let result = getRsn(
			interaction.guildId!,
			// @ts-ignore
			channel.user.id
		);

		let response = 'Error getting rsn, maybe the user is not activated?';
		result
			.then((res: any) => {
				console.log(res);
				if (res[0]) {
					response = '';
					res.forEach((account: any) => {
						response += `Name: ${account.rsn} Type: ${account.type}\n`;
					});
				}
			})
			.catch((err: any) => {
				console.log(err);
			})
			.finally(() => {
				interaction.reply(response);
			});
	}
}
