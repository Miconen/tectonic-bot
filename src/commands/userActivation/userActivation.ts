import { Discord, Guard, Slash, SlashOption } from "discordx";
import {
	ApplicationCommandOptionType,
	CommandInteraction,
	GuildMember,
} from "discord.js";
import activationHelper from "./func/activationHelper.js";
import deactivationHelper from "./func/deactivationHelper.js";
import IsAdmin from "@guards/IsAdmin.js";

@Discord()
@Guard(IsAdmin)
class Activation {
	@Slash({
		name: "activate",
		description:
			"Used for activating new guild members and giving access to rank points",
	})
	async Activate(
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
		interaction: CommandInteraction,
	) {
		return activationHelper(user, rsn, interaction);
	}

	@Slash({
		name: "deactivate",
		description:
			"Deactivate and remove all points/data entries associated with a user",
	})
	async Deactivate(
		@SlashOption({
			name: "username",
			description:
				"@User tag to deactivate, WARNING USERS POINTS WILL BE DELETED",
			required: true,
			type: ApplicationCommandOptionType.User,
		})
		user: GuildMember,
		interaction: CommandInteraction,
	) {
		return deactivationHelper(user, interaction);
	}
}
