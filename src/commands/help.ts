import { Discord, Slash, SlashOption, SlashGroup } from 'discordx';
import { CommandInteraction, User } from 'discord.js'

@Discord()
@SlashGroup({ name: 'help', description: 'Commands to help you use commands' })
@SlashGroup('points')
class Help {
	@Slash('bump')
	lookup(
		interaction: CommandInteraction
	) {
        interaction.reply('Points for activity: ');
    }
}