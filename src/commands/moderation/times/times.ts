import {
	ApplicationCommandOptionType,
	type GuildMember,
	type CommandInteraction,
} from "discord.js";
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";
import IsAdmin from "@guards/IsAdmin.js";
import { bossTimePicker } from "@utils/pickers";
import { removeTimeHelper } from "./func/removeTimeHelper";
import { addUserToTimeHelper } from "./func/addUserToTimeHelper";
import { removeUserFromTimeHelper } from "./func/removeUserFromTimeHelper";

@Discord()
@SlashGroup({
	name: "times",
	description: "Manage times",
	root: "moderation",
})
@SlashGroup("times", "moderation")
@Guard(IsAdmin)
class Times {
	@Slash({ name: "revert", description: "Revert a time to an older one" })
	async remove(
		@SlashOption({
			name: "boss",
			description: "Boss name to remove pb from",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: bossTimePicker,
		})
		boss: string,
		interaction: CommandInteraction,
	) {
		await removeTimeHelper(boss, interaction);
	}

	@Slash({ name: "adduser", description: "Manually add a user to a time" })
	async adduser(
		@SlashOption({
			name: "username",
			description: "@User tag to add to a time",
			required: true,
			type: ApplicationCommandOptionType.User,
		})
		user: GuildMember,
		@SlashOption({
			name: "boss",
			description: "Boss name to add user to",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: bossTimePicker,
		})
		boss: string,
		interaction: CommandInteraction,
	) {
		await addUserToTimeHelper(user, boss, interaction);
	}

	@Slash({
		name: "removeuser",
		description: "Manually remove a user from a time",
	})
	async removeuser(
		@SlashOption({
			name: "username",
			description: "@User tag to remove from a time",
			required: true,
			type: ApplicationCommandOptionType.User,
		})
		user: GuildMember,
		@SlashOption({
			name: "boss",
			description: "Boss name to remove user from",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: bossTimePicker,
		})
		boss: string,
		interaction: CommandInteraction,
	) {
		await removeUserFromTimeHelper(user, boss, interaction);
	}
}
