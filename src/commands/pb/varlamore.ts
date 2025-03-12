import IsActivated from "@guards/IsActivated.js";
import IsAdmin from "@guards/IsAdmin.js";
import IsValidTime from "@guards/IsValidTime.js";
import { replyHandler } from "@utils/replyHandler.js";
import {
	ApplicationCommandOptionType,
	type CommandInteraction,
	type GuildMember,
} from "discord.js";
import {
	Discord,
	Guard,
	Slash,
	SlashChoice,
	SlashGroup,
	SlashOption,
} from "discordx";
import bossCategories from "./func/getBosses.js";
import submitHandler from "./func/submitHandler.js";

@Discord()
@SlashGroup("pb")
@Guard(IsAdmin, IsValidTime("time"), IsActivated())
class varlamorepb {
	@Slash({ name: "varlamore", description: "Request your new pb to be added" })
	async slayer(
		@SlashChoice(...bossCategories.Varlamore)
		@SlashOption({
			name: "boss",
			description: "Boss to submit time for",
			required: true,
			type: ApplicationCommandOptionType.String,
		})
		boss: string,
		@SlashOption({
			name: "time",
			description: "Varlamore specific pb time",
			required: true,
			type: ApplicationCommandOptionType.String,
		})
		time: string,
		@SlashOption({
			name: "player",
			description: "Player discord @name",
			required: true,
			type: ApplicationCommandOptionType.User,
		})
		player: GuildMember,
		interaction: CommandInteraction,
	) {
		const team = [player.user.id];

		await interaction.deferReply();
		const response = await submitHandler(boss, time, team, interaction);
		await replyHandler(response, interaction);
	}
}
