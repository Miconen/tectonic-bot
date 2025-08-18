import { Requests } from "@requests/main";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import type { CommandInteraction, GuildMember } from "discord.js";

export async function winnerHelper(
	interaction: CommandInteraction,
	competitionId: number,
	top = 3,
) {
	if (!interaction.guild) {
		await replyHandler(getString("errors", "noGuild"), interaction, {
			ephemeral: true,
		});
		return;
	}

	if (!interaction.member) {
		await replyHandler(getString("errors", "noMember"), interaction, {
			ephemeral: true,
		});
		return;
	}

	const res = await Requests.eventWinners(interaction.guild.id, {
		type: "individual",
		competition: competitionId,
		top,
	});

	if (res.error) {
		return replyHandler(res.message, interaction);
	}

	// const winners = res.data;
	// const response: string[] = [];
	//
	// response.push("# Event positions given");
	// for (const winner of winners) {
	// 	response.push(winner.player.displayName);
	// }
	//
	// return responseHandler(response.join("\n"), interaction);

	return replyHandler(getString("success", "success"), interaction, {
		ephemeral: true,
	});
}
