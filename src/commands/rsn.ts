import { Discord, Slash, SlashOption, SlashGroup, SlashChoice } from 'discordx';
import { CommandInteraction, User } from 'discord.js';

@Discord()
@SlashGroup({ name: 'rsn', description: 'Runescape name related commands' })
@SlashGroup('rsn')
class RSN {
	@Slash('set')
	lookup(
		@SlashOption('username')
		username: string,
		interaction: CommandInteraction
	) {
		// TODO: SANITISE THE USERNAME INPUT TO AVOID SQL INJECTION
		interaction.reply(`${username}`);
	}
	@Slash('setiron')
	setiron(
		@SlashChoice({ name: 'I am a main', value: 0 })
		@SlashChoice({ name: 'I am an ironman', value: 1 })
		@SlashOption('ironman', {
			description: 'Is your account an ironman or a main',
		})
		value: number
	) {
		// Verify user has rsn set
	}
}
