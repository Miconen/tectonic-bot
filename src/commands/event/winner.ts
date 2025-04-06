import IsAdmin from "@guards/IsAdmin";
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
			name: "team",
			description: "Name of the winning team",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: teamPicker,
		})
		@SlashOption({
			name: "position",
			description: "Which placement did the team end up in",
			type: ApplicationCommandOptionType.Integer,
			minValue: 1,
			maxValue: 3,
		})
		competitionId: number,
		team: string,
		position: number | undefined,
		interaction: CommandInteraction,
	) {
		return winnerTeamHelper(interaction, competitionId, team, position);
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
