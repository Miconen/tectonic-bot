import { Discord, Slash, SlashOption } from 'discordx';
import {
	ApplicationCommandOptionType,
	CommandInteraction,
	GuildMember,
} from 'discord.js';
import getPoints from '../data/database/getPoints.js';

@Discord()
class Points {
	@Slash({ name: 'points', description: 'Point checking utility' })
	points(
		@SlashOption({
			name: 'username',
			description:
				'Leave blank to check personal points or supply a name to check another user.',
			required: false,
			type: ApplicationCommandOptionType.User,
		})
		user: GuildMember,
		interaction: CommandInteraction
	) {
		let targetUser = user?.user?.id ?? interaction.user.id;
		let result = getPoints(interaction.guildId!, targetUser);

		result
			.then((points) => {
				interaction.reply(`${points} points`);
			})
			.catch((err) => {
				interaction.reply(
					'Error getting points, selected user is not activated'
				);
			});
	}
}
