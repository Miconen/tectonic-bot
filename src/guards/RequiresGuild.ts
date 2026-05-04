import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import type { CommandInteraction } from "discord.js";
import type { GuardFunction } from "discordx";

const RequiresGuild: GuardFunction<CommandInteraction> = async (
  interaction,
  _,
  next
) => {
  if (interaction.inCachedGuild()) return await next();

  return await replyHandler(getString("errors", "noGuild"), interaction, {
    ephemeral: true,
  });
};

export default RequiresGuild;
