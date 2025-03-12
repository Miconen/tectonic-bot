import {
	ApplicationCommandOptionType,
	type CommandInteraction,
	type GuildMember,
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import pointsHelper from "./func/pointsHelper.js";

@Discord()
class Points {
	@Slash({
		name: "points",
		description: "Check your or someone elses points",
	})
	async points(
		@SlashOption({
			name: "username",
			description:
				"Leave blank to check personal points or supply a name to check another user.",
			required: false,
			type: ApplicationCommandOptionType.User,
		})
		user: GuildMember | null,
		interaction: CommandInteraction,
	) {
		return pointsHelper(user, interaction);
	}
}
