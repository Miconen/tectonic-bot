import IsActivated from "@guards/IsActivated.js";
import IsAdmin from "@guards/IsAdmin.js";
import IsValidTime from "@guards/IsValidTime.js";
import { notEmpty } from "@utils/notEmpty.js";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
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
class nightmarepb {
	@Slash({
		name: "nightmare",
		description: "Request your new pb to be added",
	})
	async nightmare(
		@SlashChoice(...bossCategories.Nightmare)
		@SlashOption({
			name: "boss",
			description: "Boss to submit time for",
			required: true,
			type: ApplicationCommandOptionType.String,
		})
		boss: string,
		@SlashOption({
			name: "time",
			description: "Nightmare pb time",
			required: true,
			type: ApplicationCommandOptionType.String,
		})
		time: string,
		@SlashOption({
			name: "player1",
			description: "Player discord @name",
			required: true,
			type: ApplicationCommandOptionType.User,
		})
		player1: GuildMember,
		@SlashOption({
			name: "player2",
			description: "Teammate discord @name",
			required: false,
			type: ApplicationCommandOptionType.User,
		})
		player2: GuildMember | null,
		@SlashOption({
			name: "player3",
			description: "Teammate discord @name",
			required: false,
			type: ApplicationCommandOptionType.User,
		})
		player3: GuildMember | null,
		@SlashOption({
			name: "player4",
			description: "Teammate discord @name",
			required: false,
			type: ApplicationCommandOptionType.User,
		})
		player4: GuildMember | null,
		@SlashOption({
			name: "player5",
			description: "Teammate discord @name",
			required: false,
			type: ApplicationCommandOptionType.User,
		})
		player5: GuildMember | null,
		interaction: CommandInteraction,
	) {
		const team = [
			player1.user.id,
			player2?.user.id,
			player3?.user.id,
			player4?.user.id,
			player5?.user.id,
		].filter(notEmpty);

		await interaction.deferReply();

		// Handle solos
		if (team.length > 1 && (boss === "pnm" || boss === "nm_1")) {
			await replyHandler(getString("times", "soloOnlyBoss"), interaction, {
				ephemeral: true,
			});
		}

		// Handle 5-man nightmare
		if (team.length !== 5 && boss === "nm_5") {
			await replyHandler(
				getString("times", "invalidFiveManNightmare"),
				interaction,
				{ ephemeral: true },
			);
		}

		const response = await submitHandler(boss, time, team, interaction);
		await replyHandler(response, interaction);
	}
}
