import { Requests } from "@requests/main.js";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import { type ChatInputCommandInteraction, GuildMember } from "discord.js";
import type { GuardFunction } from "discordx";
import { getLogger } from "@logging/context";

function IsActivated(target = "player") {
  const guard: GuardFunction<ChatInputCommandInteraction> = async (
    interaction,
    _,
    next
  ) => {
    const logger = getLogger();
    logger.info("Checking if all players are activated (IsActivated guard)");

    const players: GuildMember[] = [];

    // Always include the invoking user
    if (interaction.member && interaction.member instanceof GuildMember) {
      players.push(interaction.member);
    }

    // Also include any explicitly tagged players from options
    const options = interaction.options.data.at(0)?.options;
    if (options) {
      for (const option of options) {
        if (
          option.name.includes(target) &&
          option.member instanceof GuildMember
        ) {
          const member = option.member;
          if (!players.some((p) => p.id === member.id)) {
            players.push(member);
          }
        }
      }
    }

    if (!players.length) {
      logger.warn("Error retrieving players");
      return await replyHandler(
        getString("errors", "retrievingPlayers"),
        interaction
      );
    }
    logger.debug("Players list populated");

    if (!interaction.guild?.id) {
      logger.warn("Error getting guild ID");
      return await replyHandler(getString("errors", "noGuild"), interaction);
    }

    const playersUserIds = players.map((member) => member.id);
    const playersUserNames = players.map((member) => member.displayName);
    logger.info({ players: playersUserNames }, "Checking activation statuses");

    const res = await Requests.getUsers(interaction.guild.id, {
      type: "user_id",
      user_id: playersUserIds,
    });
    if (res.error)
      return await replyHandler(
        getString("errors", "fetchFailed", { resource: "users" }),
        interaction,
        { ephemeral: true }
      );
    if (!res.data.length)
      return await replyHandler(
        getString("errors", "fetchFailed", { resource: "users" }),
        interaction,
        { ephemeral: true }
      );

    const existingUsers = res.data;

    let warning = "";

    for (const member of players) {
      const userExists = existingUsers.some(
        (user) => user.user_id === member.id
      );
      if (!userExists) {
        logger.info({ user: member.displayName }, "Denied, not activated");
        warning += `❌ **${member.displayName}** is not activated.\n`;
      }
    }

    if (warning) {
      logger.info("Guard failed — unactivated users found");
      return await replyHandler(
        getString("errors", "commandFailed", { reason: warning }),
        interaction,
        { ephemeral: true }
      );
    }

    logger.info("Passed");
    await next();
  };

  return guard;
}

export default IsActivated;
