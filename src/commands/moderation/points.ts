import type { Role, CommandInteraction, GuildMember } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";
import IsAdmin from "@guards/IsAdmin.js";
import giveHelper from "./func/giveHelper.js";
import multiplierHelper from "./func/multiplierHelper.js";
import { pointSourcePicker } from "@utils/pickers.js";
import { getString } from "@utils/stringRepo.js";
import womHelper from "./func/womHelper.js";
import { replyHandler } from "@utils/replyHandler.js";

@Discord()
@Guard(IsAdmin)
@SlashGroup({
	description: "Manage user points",
	name: "points",
	root: "moderation",
})
@SlashGroup("points", "moderation")
class Points {
	@Slash({ name: "give", description: "Give points to a user" })
	async give(
		@SlashOption({
			name: "username",
			description: "@User tag to give points to",
			required: true,
			type: ApplicationCommandOptionType.User,
		})
		target: GuildMember,
		@SlashOption({
			name: "amount",
			description: "Amount of points to give",
			required: true,
			type: ApplicationCommandOptionType.Number,
		})
		addedPoints: number,
		interaction: CommandInteraction,
	) {
		await interaction.deferReply()
		const res = await giveHelper(target, addedPoints, interaction);
		await replyHandler(res, interaction);
	}

	@Slash({
		name: "source",
		description: "Give points to a user by a point source",
	})
	async source(
		@SlashOption({
			name: "username",
			description: "@User tag to give points to",
			required: true,
			type: ApplicationCommandOptionType.User,
		})
		target: GuildMember,
		@SlashOption({
			name: "source",
			description: "Point source to give",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: pointSourcePicker,
		})
		source: string,
		interaction: CommandInteraction,
	) {
		await interaction.deferReply()
		const res = await giveHelper(target, source, interaction);
		await replyHandler(res, interaction);
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
		await interaction.deferReply()
		return multiplierHelper(multiplier, interaction);
	}

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
			description: "Point source to give",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: pointSourcePicker,
		})
		source: string,
		interaction: CommandInteraction,
	) {
		if (!interaction.guild)
			return await interaction.reply(getString("errors", "noGuild"));

		await interaction.deferReply()
		await interaction.guild.members.fetch();

		const res = await giveHelper(role.members, source, interaction);
		await replyHandler(res, interaction);
	}

	@Slash({ name: "rolebypoints", description: "Event point for a whole role by point amount" })
	async rolebypoints(
		@SlashOption({
			name: "role",
			description: "Role for which to award points",
			required: true,
			type: ApplicationCommandOptionType.Role,
		})
		role: Role,
		@SlashOption({
			name: "amount",
			description: "Amount of points to give",
			required: true,
			type: ApplicationCommandOptionType.Number,
		})
		addedPoints: number,
		interaction: CommandInteraction,
	) {
		if (!interaction.guild)
			return await interaction.reply(getString("errors", "noGuild"));

		await interaction.deferReply()
		await interaction.guild.members.fetch();

		const res = await giveHelper(role.members, addedPoints, interaction);
		await replyHandler(res, interaction);
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
		await womHelper(competitionId, interaction, cutoff);
	}
}
