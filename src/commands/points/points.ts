import { Discord, Slash, SlashOption } from 'discordx';
import {
	ApplicationCommandOptionType,
	CommandInteraction,
	GuildMember,
} from 'discord.js';
import giveHelper from "./func/giveHelper";

@Discord()
class Points {
	@Slash({
		name: 'points',
		description: 'Check your or someone elses points',
	})
	async points(
		@SlashOption({
			name: 'username',
			description:
				'Leave blank to check personal points or supply a name to check another user.',
			required: false,
			type: ApplicationCommandOptionType.User,
		})
		user: GuildMember | null,
		interaction: CommandInteraction
	) {
		return giveHelper(user, interaction);
	}
}
