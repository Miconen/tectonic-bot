import IsAdmin from "@guards/IsAdmin.js";
import {
	ApplicationCommandOptionType,
	type CommandInteraction,
	type GuildMember,
} from "discord.js";
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";
import activationHelper from "./func/activationHelper.js";
import deactivationHelper from "./func/deactivationHelper.js";
import { safeDefer } from "@utils/safeDefer.js";

@Discord()
@Guard(IsAdmin)
@SlashGroup({
	description: "Manage user status",
	name: "status",
	root: "moderation",
})
@SlashGroup("status", "moderation")
class Activation {
	@Slash({
		name: "activate",
		description:
			"Used for activating new guild members and giving access to rank points",
	})
	async activate(
		@SlashOption({
			name: "username",
			description: "@User tag to activate",
			required: true,
			type: ApplicationCommandOptionType.User,
		})
		user: GuildMember,
		@SlashOption({
			name: "rsn",
			description: "RSN to add",
			required: true,
			type: ApplicationCommandOptionType.String,
		})
		rsn: string,
		interaction: CommandInteraction<"cached">,
	) {
		await safeDefer(interaction);
		return activationHelper(user, rsn, interaction);
	}

	@Slash({
		name: "deactivate",
		description:
			"Deactivate and remove all points/data entries associated with a user",
	})
	async deactivate(
		@SlashOption({
			name: "username",
			description:
				"@User tag to deactivate, WARNING USERS POINTS WILL BE DELETED",
			required: true,
			type: ApplicationCommandOptionType.User,
		})
		user: GuildMember,
		interaction: CommandInteraction<"cached">,
	) {
		await safeDefer(interaction);
		return deactivationHelper(user, interaction);
	}
}
