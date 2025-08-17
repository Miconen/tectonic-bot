import {
	ApplicationCommandOptionType,
	type CommandInteraction,
	type GuildMember,
} from "discord.js";
import { Discord, Guard, Slash, SlashOption } from "discordx";
import IsAdmin from "../../guards/IsAdmin.js";
import giveHelper from "./func/giveHelper.js";
import multiplierHelper from "./func/multiplierHelper.js";
import startHelper from "./func/startHelper.js";

@Discord()
@Guard(IsAdmin)
class Moderation {
	@Slash({ name: "give", description: "Give points to a user" })
	async give(
		@SlashOption({
			name: "username",
			description: "@User tag to give points to",
			required: true,
			type: ApplicationCommandOptionType.User,
		})
		user: GuildMember,
		@SlashOption({
			name: "amount",
			description: "Amount of points to give",
			required: true,
			type: ApplicationCommandOptionType.Number,
		})
		addedPoints: number,
		interaction: CommandInteraction,
	) {
		return giveHelper(user, addedPoints, interaction);
	}

	@Slash({
		name: "setmultiplier",
		description: "Set a server wide point multiplier",
	})
	async setmultiplier(
		@SlashOption({
			name: "multiplier",
			description: "Number that all points given will get multiplied by",
			required: true,
			type: ApplicationCommandOptionType.Number,
		})
		multiplier: number,
		interaction: CommandInteraction,
	) {
		return multiplierHelper(multiplier, interaction);
	}

	@Slash({
		name: "start",
		description: "Setup command for the whole guild",
	})
	async start(interaction: CommandInteraction) {
		return startHelper(interaction);
	}
}
