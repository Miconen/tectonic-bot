import {
	ApplicationCommandOptionType,
	type CommandInteraction,
	type GuildMember,
} from "discord.js";
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";
import IsAdmin from "@guards/IsAdmin.js";
import { achievementAddPicker, achievementRemovePicker } from "@utils/pickers";
import { giveAchievementHelper } from "@commands/achievements/func/giveAchievement";
import { removeAchievementHelper } from "@commands/achievements/func/removeAchievement";

@Discord()
@Guard(IsAdmin)
@SlashGroup({
	description: "Manage user achievements",
	name: "achievements",
	root: "moderation",
})
@SlashGroup("achievements", "moderation")
class Achievements {
	@Slash({
		name: "grant",
		description: "Grant an achievement",
	})
	@Guard(IsAdmin)
	async grant(
		@SlashOption({
			name: "username",
			description: "@User tag to target",
			required: true,
			type: ApplicationCommandOptionType.User,
		})
		user: GuildMember,
		@SlashOption({
			name: "achievement",
			description: "Achievement to grant to user",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: achievementAddPicker,
		})
		achievement: string,
		interaction: CommandInteraction,
	) {
		await giveAchievementHelper(user, interaction, achievement);
	}

	@Slash({
		name: "remove",
		description: "Remove an achievement from a user",
	})
	@Guard(IsAdmin)
	async remove(
		@SlashOption({
			name: "username",
			description: "@User tag to target",
			required: true,
			type: ApplicationCommandOptionType.User,
		})
		user: GuildMember,
		@SlashOption({
			name: "achievement",
			description: "Achievement to remove",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: achievementRemovePicker,
		})
		achievement: string,
		interaction: CommandInteraction,
	) {
		await removeAchievementHelper(user, interaction, achievement);
	}
}
