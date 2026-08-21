import IsAdmin from "@guards/IsAdmin";
import RequiresGuild from "@guards/RequiresGuild";
import { teamPicker } from "@pickers/teams";
import { Requests } from "@requests/main.js";
import { notEmpty } from "@utils/notEmpty";
import { replyHandler } from "@utils/replyHandler.js";
import {
	ApplicationCommandOptionType,
	MessageFlags,
	type CommandInteraction,
} from "discord.js";
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";
import { winnerHelper } from "./func/winnerHelper";
import { winnerTeamHelper } from "./func/winnerTeamHelper";
import { replyApiError } from "@utils/replyApiError";
import { safeDefer } from "@utils/safeDefer";

@Discord()
@SlashGroup({
	description: "Create guild events",
	name: "create",
	root: "event",
})
@SlashGroup("create", "event")
@Guard(IsAdmin, RequiresGuild)
class EventCreate {
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
		interaction: CommandInteraction<"cached">,
	) {
		const team_names = [team1, team2, team3].filter(notEmpty);
		await safeDefer(interaction, { flags: MessageFlags.Ephemeral });
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
		interaction: CommandInteraction<"cached">,
	) {
		await safeDefer(interaction, { flags: MessageFlags.Ephemeral });
		return winnerHelper(interaction, competitionId, top);
	}

	@Slash({
		name: "legacy",
		description: "Register a legacy event with Discord user IDs",
	})
	async legacy(
		@SlashOption({
			name: "name",
			description: "Event name (e.g. 'Summer Bingo 2023')",
			required: true,
			type: ApplicationCommandOptionType.String,
		})
		name: string,
		@SlashOption({
			name: "winners",
			description: "Comma-separated Discord user IDs of the winners",
			required: true,
			type: ApplicationCommandOptionType.String,
		})
		winners: string,
		interaction: CommandInteraction<"cached">,
	) {
		await safeDefer(interaction, { flags: MessageFlags.Ephemeral });

		const userIds = winners
			.split(",")
			.map((id) => id.trim())
			.filter((id) => id.length > 0);

		if (userIds.length === 0) {
			return await replyHandler("No valid user IDs provided.", interaction, {
				flags: MessageFlags.Ephemeral,
			});
		}

		const res = await Requests.registerLegacyEvent(
			interaction.guild.id,
			name,
			userIds,
		);

		if (res.error) {
			return await replyApiError(res, interaction, {
				category: "eventErrors",
				args: { event: name },
			});
		}

		const mentions = userIds.map((id) => `<@${id}>`).join(", ");
		return await replyHandler(
			`Legacy event **${name}** registered with ${userIds.length} winner${
				userIds.length > 1 ? "s" : ""
			}: ${mentions}`,
			interaction,
			{ flags: MessageFlags.Ephemeral },
		);
	}
}
