import type { CommandInteraction, GuildMember } from "discord.js";
import type IRankService from "@utils/rankUtils/IRankService";
import { Requests } from "@requests/main.js";

import { container } from "tsyringe";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import { dumpUserData } from "@utils/dumpUserData";
import { getLogger } from "@logging/context";

const deactivationHelper = async (
  user: GuildMember,
  interaction: CommandInteraction<"cached">
) => {
  const logger = getLogger();
  const rankService = container.resolve<IRankService>("RankService");
  await interaction.deferReply();

  // Fetch BEFORE removal (removeUser purges the user's records/times)
  const res = await Requests.getUser(interaction.guild.id, {
    type: "user_id",
    user_id: user.id,
  });

  if (!res.error && res.data) {
    try {
      await dumpUserData(
        interaction.client,
        interaction.guild.id,
        user.id,
        res.data,
        "Deactivation"
      );
    } catch (e) {
      logger.warn(
        { err: e, userId: user.id, guildId: interaction.guild.id },
        "Failed to dump deactivated user's data"
      );
    }
  }

  const result = await Requests.removeUser(interaction.guild.id, {
    type: "user_id",
    user_id: user.user.id,
  });

  if (result.status === 404) {
    return await replyHandler(
      getString("errors", "notActivated", {
        username: user.displayName,
      }),
      interaction
    );
  }

  if (result.error) {
    return await replyHandler(
      getString("errors", "internalError", {
        username: user.displayName,
      }),
      interaction
    );
  }

  // Remove all rank roles
  await rankService.removeOldRoles(user);
  return await replyHandler(
    getString("accounts", "deactivated", { username: user.displayName }),
    interaction
  );
};

export default deactivationHelper;
