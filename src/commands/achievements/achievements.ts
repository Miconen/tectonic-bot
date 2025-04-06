import IsAdmin from "@guards/IsAdmin.js";
import { getString } from "@utils/stringRepo";
import {
	ApplicationCommandOptionType,
	type CommandInteraction,
	type GuildMember,
} from "discord.js";
import { Discord, Guard, Slash, SlashOption } from "discordx";
import { achievementPicker, rsnPicker } from "./func/autocomplete";

@Discord()
class achievement {
	@Slash({
		name: "request",
		description: "Submit an achievement request",
	})
	async request(
		@SlashOption({
			name: "rsn",
			description: "RSN of the account",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: rsnPicker,
		})
		rsn: string,
		@SlashOption({
			name: "achievement",
			description: "Achievement to request",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: achievementPicker,
		})
		achievement: string,
		interaction: CommandInteraction,
	) {
		return await interaction.reply(
			getString("achievements", "request", {
				username: interaction.user.username,
				rsn,
				achievement,
			}),
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
			name: "rsn",
			description: "RSN of the user",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: rsnPicker,
		})
		rsn: string,
		@SlashOption({
			name: "achievement",
			description: "Achievement to grant to user",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: achievementPicker,
		})
		achievement: string,
		interaction: CommandInteraction,
	) {
		return await interaction.reply(
			`**Granting:** ${user.displayName} ${rsn} ${achievement}`,
		);
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
			name: "rsn",
			description: "RSN of the user",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: rsnPicker,
		})
		rsn: string,
		@SlashOption({
			name: "achievement",
			description: "Achievement to remove",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: achievementPicker,
		})
		achievement: string,
		interaction: CommandInteraction,
	) {
		return await interaction.reply(
			`**Removing:** ${user.displayName} ${rsn} ${achievement}`,
		);
	}
}
