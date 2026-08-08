import { Requests } from "@requests/main";
import { replyApiError } from "@utils/replyApiError";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import { MessageFlags, type CommandInteraction } from "discord.js";

export async function winnerHelper(
	interaction: CommandInteraction<"cached">,
	competitionId: number,
	top = 3,
) {
	const res = await Requests.eventWinners(interaction.guild.id, {
		type: "individual",
		competition: competitionId,
		top,
	});

	if (res.error) {
		return await replyApiError(res, interaction, {
			category: "eventErrors",
		});
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
		flags: MessageFlags.Ephemeral,
	});
}
