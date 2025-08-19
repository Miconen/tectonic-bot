import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import {
	ApplicationCommandOptionType,
	type CommandInteraction,
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { achievementAddPicker } from "@utils/pickers.js";

@Discord()
class achievement {
	@Slash({
		name: "request",
		description: "Submit an achievement request",
	})
	async request(
		@SlashOption({
			name: "achievement",
			description: "Achievement to request",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: achievementAddPicker,
		})
		achievement: string,
		interaction: CommandInteraction,
	) {
		return await replyHandler(
			getString("achievements", "request", {
				username: interaction.user.username,
				achievement,
			}),
			interaction,
		);
	}
}
