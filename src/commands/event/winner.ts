import IsAdmin from "@guards/IsAdmin";
import { notEmpty } from "@utils/notEmpty";
import {
	ApplicationCommandOptionType,
	type CommandInteraction,
} from "discord.js";
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";
import { teamPicker } from "./func/autocomplete";
import { winnerHelper } from "./func/winnerHelper";
import { winnerTeamHelper } from "./func/winnerTeamHelper";

@Discord()
@SlashGroup({
	name: "winner",
	description: "Reward event winners",
	root: "event",
})
@SlashGroup("winner", "event")
@Guard(IsAdmin)
class Winners {
	@Slash({ name: "team", description: "Reward team event winners" })
	async team(
		@SlashOption({
			name: "competition",
			description: "ID of the WOM competition",
			required: true,
			type: ApplicationCommandOptionType.Integer,
		})
		@SlashOption({
			name: "team1",
			description: "Name of the winning team",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: teamPicker,
		})
		@SlashOption({
			name: "team2",
			description: "Name of the second team",
			required: false,
			type: ApplicationCommandOptionType.String,
			autocomplete: teamPicker,
		})
		@SlashOption({
			name: "team3",
			description: "Name of the third team",
			required: false,
			type: ApplicationCommandOptionType.String,
			autocomplete: teamPicker,
		})
		competitionId: number,
		team1: string,
		team2: string | undefined,
		team3: string | undefined,
		interaction: CommandInteraction,
	) {
		const team_names = [team1, team2, team3].filter(notEmpty);
		return winnerTeamHelper(interaction, competitionId, team_names);
	}

	@Slash({ name: "individual", description: "Reward individual event winners" })
	async individual(
		@SlashOption({
			name: "competition",
			description: "ID of the WOM competition",
			required: true,
			type: ApplicationCommandOptionType.Integer,
		})
		@SlashOption({
			name: "top",
			description: "How many placements to reward",
			type: ApplicationCommandOptionType.Integer,
			minValue: 1,
			maxValue: 3,
		})
		competitionId: number,
		top: number | undefined,
		interaction: CommandInteraction,
	) {
		return winnerHelper(interaction, competitionId, top);
	}
}
