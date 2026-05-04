import { Requests } from "@requests/main";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import type { CommandInteraction } from "discord.js";

export async function winnerTeamHelper(
  interaction: CommandInteraction<"cached">,
  competitionId: number,
  team_names: string[]
) {
  const res = await Requests.eventWinners(interaction.guild.id, {
    type: "team",
    competition: competitionId,
    team_names,
  });

  if (res.error) {
    return replyHandler(res.message, interaction);
  }

  // const winners = res.data;
  // const response: string[] = [];
  //
  // response.push("# Team event positions given");
  // for (const winner of winners) {
  // 	response.push(winner.player.displayName);
  // }
  //
  // return replyHandler(response.join("\n"), interaction);

  return replyHandler(getString("success", "success"), interaction, {
    ephemeral: true,
  });
}
