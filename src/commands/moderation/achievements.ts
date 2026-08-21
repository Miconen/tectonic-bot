import { giveAchievementHelper } from "@commands/achievements/func/giveAchievement";
import { removeAchievementHelper } from "@commands/achievements/func/removeAchievement";
import IsAdmin from "@guards/IsAdmin.js";
import RequiresGuild from "@guards/RequiresGuild";
import {
	achievementAddPicker,
	achievementRemovePicker,
} from "@pickers/achievements";
import { safeDefer } from "@utils/safeDefer";
import {
	ApplicationCommandOptionType,
	MessageFlags,
	type CommandInteraction,
	type GuildMember,
} from "discord.js";
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";

@Discord()
@Guard(IsAdmin, RequiresGuild)
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
		interaction: CommandInteraction<"cached">,
	) {
		await safeDefer(interaction, { flags: MessageFlags.Ephemeral });
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
		interaction: CommandInteraction<"cached">,
	) {
		await safeDefer(interaction, { flags: MessageFlags.Ephemeral });
		await removeAchievementHelper(user, interaction, achievement);
	}
}
