import { Discord, Slash } from 'discordx';
import { CommandInteraction } from 'discord.js';

@Discord()
class UserMessages {
	@Slash('febble')
	febble(interaction: CommandInteraction) {
		interaction.reply(
			'I’m telling you, Febble is as cracked as he is jacked. I saw him at a 7-11 the other day buying Redbull and adult diapers. I asked him what the diapers were for and he said ”they contain my full power so I don’t completely shit on these kids“ then he streamed out the door'
		);
	}
}
