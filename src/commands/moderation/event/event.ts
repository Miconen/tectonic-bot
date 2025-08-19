import {
	ApplicationCommandOptionType,
	type CommandInteraction,
	type Role,
} from "discord.js";
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";
import IsAdmin from "@guards/IsAdmin.js";
import womHelper from "./func/womHelper.js";
import giveHelper from "../func/giveHelper.js";
import { pointSourcePicker } from "@utils/pickers.js";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";

@Discord()
@SlashGroup({ name: "event", description: "Event specific commands" })
@SlashGroup("event")
@Guard(IsAdmin)
class Event {
	@Slash({ name: "role", description: "Event point for a whole role" })
	async role(
		@SlashOption({
			name: "role",
			description: "Role for which to award points",
			required: true,
			type: ApplicationCommandOptionType.Role,
		})
		role: Role,
		@SlashOption({
			name: "source",
			description: "Point source",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: pointSourcePicker,
		})
		source: number,
		interaction: CommandInteraction,
	) {
		if (!interaction.guild?.id) {
			return await replyHandler(getString("errors", "noGuild"), interaction);
		}
		await interaction.guild.members.fetch();
		return giveHelper(role.members, source, interaction);
	}

	@Slash({ name: "wom", description: "Wise old man automation" })
	async wom(
		@SlashOption({
			name: "competition",
			description: "ID of the WOM competition",
			required: true,
			type: ApplicationCommandOptionType.Integer,
		})
		@SlashOption({
			name: "cutoff",
			description: "Cutoff for xp/kills to gain points",
			required: true,
			type: ApplicationCommandOptionType.Integer,
		})
		competitionId: number,
		cutoff: number,
		interaction: CommandInteraction,
	) {
		return womHelper(competitionId, interaction, cutoff);
	}
}
