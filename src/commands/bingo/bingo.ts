import IsAdmin from "@guards/IsAdmin.js";
import RequiresGuild from "@guards/RequiresGuild";
import {
	ApplicationCommandOptionType,
	type CommandInteraction,
} from "discord.js";
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";
import { setupHelper } from "./func/setupHelper";
import { safeDefer } from "@utils/safeDefer";

@Discord()
@SlashGroup({ description: "Guild bingo information", name: "bingo" })
@SlashGroup("bingo")
@Guard(RequiresGuild)
class Bingo {
	@Slash({
		name: "setup",
		description: "Set up team channels and roles from a WOM team competition",
	})
	@Guard(IsAdmin)
	async setup(
		@SlashOption({
			name: "competition",
			description: "WOM competition ID",
			required: true,
			type: ApplicationCommandOptionType.Integer,
		})
		competitionId: number,
		@SlashOption({
			name: "text-channels",
			description: "Number of text channels per team",
			required: false,
			type: ApplicationCommandOptionType.Integer,
			minValue: 1,
			maxValue: 3,
		})
		textChannels: number | undefined,
		@SlashOption({
			name: "voice-channels",
			description: "Number of voice channels per team",
			required: false,
			type: ApplicationCommandOptionType.Integer,
			minValue: 1,
			maxValue: 3,
		})
		voiceChannels: number | undefined,
		interaction: CommandInteraction<"cached">,
	) {
		await safeDefer(interaction);
		return setupHelper(
			competitionId,
			textChannels ?? 1,
			voiceChannels ?? 1,
			interaction,
		);
	}
}
