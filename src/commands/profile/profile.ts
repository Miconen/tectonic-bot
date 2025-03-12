import { Discord, Slash, SlashOption } from "discordx";
import {
	ApplicationCommandOptionType,
	CommandInteraction,
	GuildMember,
} from "discord.js";
import profileHelper from "./func/profileHelper.js";

@Discord()
class profile {
	@Slash({
		name: "profile",
		description: "Check your or someone elses profile",
	})
	async points(
		@SlashOption({
			name: "username",
			description:
				"Leave blank to check personal profile or supply a name to check another user.",
			required: false,
			type: ApplicationCommandOptionType.User,
		})
		user: GuildMember | null,
		@SlashOption({
			name: "rsn",
			description: "RSN connected to the user profile.",
			required: false,
			type: ApplicationCommandOptionType.String,
		})
		rsn: string | null,
		interaction: CommandInteraction,
	) {
		if (user && rsn) {
			return await interaction.reply({
				ephemeral: true,
				content: `❌ Can't look for a member by @ AND rsn.`,
			});
		}

		const response = await profileHelper(user, rsn, interaction);
		await interaction.reply(response);
	}
}
