import { Discord, Slash, SlashGroup } from 'discordx';
import { CommandInteraction } from 'discord.js';

@Discord()
@SlashGroup({ name: 'quote', description: 'Points related commands' })
@SlashGroup('quote')
class UserMessages {
	@Slash({ name: 'febble', description: 'Febble quote' })
	async febble(interaction: CommandInteraction) {
		await interaction.reply(
			'"I’m telling you, Febble is as cracked as he is jacked. I saw him at a 7-11 the other day buying Redbull and adult diapers. I asked him what the diapers were for and he said ”they contain my full power so I don’t completely shit on these kids“ then he streamed out the door" - Eve'
		);
	}
	@Slash({ name: 'steve', description: 'Steve quote' })
	async steve(interaction: CommandInteraction) {
		await interaction.reply(`"Hello I'm Steve I'm a doctor of edging" -Steve`);
	}
}