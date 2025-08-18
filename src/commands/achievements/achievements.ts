import IsAdmin from "@guards/IsAdmin.js";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import {
	ApplicationCommandOptionType,
	type CommandInteraction,
	type GuildMember,
} from "discord.js";
import { Discord, Guard, Slash, SlashOption } from "discordx";
import { giveAchievementHelper } from "./func/achievementsHelper";
import {
	achievementAddPicker,
	achievementPicker,
	achievementRemovePicker,
} from "@utils/pickers.js";

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
		return await replyHandler(
			getString("achievements", "removed", {
				achievement,
				username: user.displayName,
			}),
			interaction,
		);
	}
}
