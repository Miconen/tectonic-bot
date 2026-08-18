import IsActivated from "@guards/IsActivated.js";
import RequiresGuild from "@guards/RequiresGuild.js";
import { achievementAddPicker } from "@pickers/achievements";
import {
	ApplicationCommandOptionType,
	type Attachment,
	type CommandInteraction,
} from "discord.js";
import { Discord, Guard, Slash, SlashOption } from "discordx";
import requestHelper from "./func/requestHelper.js";

@Discord()
@Guard(IsActivated(), RequiresGuild)
class Achievement {
	@Slash({
		name: "achievement",
		description: "Submit an achievement request for admin approval",
	})
	async achievement(
		@SlashOption({
			name: "achievement",
			description: "Achievement to request",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: achievementAddPicker,
		})
		achievement: string,
		@SlashOption({
			name: "screenshot",
			description: "Screenshot proof of the achievement",
			required: true,
			type: ApplicationCommandOptionType.Attachment,
		})
		screenshot: Attachment,
		interaction: CommandInteraction<"cached">,
	) {
		await interaction.deferReply();
		await requestHelper(achievement, screenshot.url, interaction);
	}
}
