import { getChildLogger } from "@logging/context";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import type {
  ButtonInteraction,
  CommandInteraction,
  GuildMember,
  PermissionsBitField,
} from "discord.js";
import type { GuardFunction } from "discordx";

function hasPermissions(userPermissions: PermissionsBitField) {
  return userPermissions.has("ModerateMembers");
}

export const IsAdmin: GuardFunction<
  ButtonInteraction | CommandInteraction
> = async (interaction, _, next) => {
  const member = interaction.member as GuildMember;
  const permissions = member.permissions as PermissionsBitField;
  const logger = getChildLogger({
    guard: "Admin permission check",
    name: member.displayName,
    username: member.user.username,
  });

  logger.debug("Checking permissions");

  if (hasPermissions(permissions)) {
    logger.debug("Checking permissions: Passed");
    await next();
  } else {
    logger.debug("Checking permissions: Denied");
    await replyHandler(getString("permissions", "adminRequired"), interaction, {
      ephemeral: true,
    });
  }
};

export default IsAdmin;
