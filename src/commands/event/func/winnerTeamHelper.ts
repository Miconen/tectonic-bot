import { Requests } from "@requests/main";
import { getString } from "@utils/stringRepo";
import type { CommandInteraction } from "discord.js";

export async function winnerTeamHelper(
	interaction: CommandInteraction,
	competitionId: number,
	team_names: string[],
) {
	if (!interaction.guild) {
		await interaction.reply({
			content: getString("errors", "noGuild"),
			ephemeral: true,
		});
		return;
	}

	const res = await Requests.eventWinners(interaction.guild.id, {
		type: "team",
		competition: competitionId,
		team_names,
	});

	if (res.error) {
		return interaction.reply(res.message);
	}

	// const winners = res.data;
	// const response: string[] = [];
	//
	// response.push("# Team event positions given");
	// for (const winner of winners) {
	// 	response.push(winner.player.displayName);
	// }
	//
	// return interaction.reply(response.join("\n"));

	return interaction.reply("Success");
}
