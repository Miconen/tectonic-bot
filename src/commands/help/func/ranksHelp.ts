import { Requests } from "@requests/main";
import { replyHandler } from "@utils/replyHandler";
import { formatDisplayName } from "@utils/formatDisplayName";
import type { CommandInteraction } from "discord.js";

const ranksHelp = async (interaction: CommandInteraction) => {
  if (!interaction.guild) {
    return await replyHandler("Must be used in a guild.", interaction);
  }

  const res = await Requests.getGuildRanks(interaction.guild.id);

  if (res.error || !res.data || res.data.length === 0) {
    return await replyHandler(
      "No rank tiers configured for this guild.",
      interaction
    );
  }

  const response = ["## Ranks:\n"];
  for (const rank of res.data) {
    const icon = rank.icon ?? "";
    response.push(
      `${icon} ${formatDisplayName(rank.name)} - ${rank.min_points} points`
    );
  }

  await replyHandler(response.join("\n"), interaction);
};

export default ranksHelp;
