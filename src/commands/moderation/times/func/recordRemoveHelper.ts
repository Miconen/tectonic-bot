import { Requests } from "@requests/main";
import { invalidateGuildCache } from "@utils/guildTimes";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import type { CommandInteraction } from "discord.js";

export async function recordRemoveHelper(
  recordIdStr: string,
  interaction: CommandInteraction<"cached">
) {
  const res = await Requests.removeTimeById(interaction.guild.id, recordIdStr);

  if (res.error) {
    return await replyHandler(
      getString("errors", "apiError", {
        activity: "removing record",
        error: res.message,
      }),
      interaction,
      { ephemeral: true }
    );
  }

  invalidateGuildCache(interaction.guild.id);

  await replyHandler(`Record \`#${recordIdStr}\` removed.`, interaction, {
    ephemeral: true,
  });
}
