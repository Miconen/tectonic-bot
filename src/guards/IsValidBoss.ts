import type { GuardFunction } from "discordx";
import type { CommandInteraction } from "discord.js";
import { getGuild } from "@utils/guildTimes";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";

async function getValidBossNames(guild_id: string): Promise<string[]> {
  const guild = await getGuild(guild_id);
  if (!guild) return [];
  return guild?.bosses.map((b) => b.name);
}

export const IsValidBoss: GuardFunction<CommandInteraction<"cached">> = async (
  interaction,
  _client,
  next
) => {
  if (!interaction.guild?.id || !interaction.isChatInputCommand()) {
    return await replyHandler(getString("errors", "noGuild"), interaction);
  }

  // Check all string options that could be a boss name
  const bossOption = interaction.options.getString("boss");
  if (!bossOption) {
    // No boss option present, let other guards/command handle it
    return next();
  }

  const validBosses = await getValidBossNames(interaction.guild.id);
  if (validBosses.length === 0) {
    // Can't validate — let it through, API will catch it
    return next();
  }

  if (!validBosses.includes(bossOption)) {
    await replyHandler(
      getString("autocomplete", "invalidBossName", { boss: bossOption }),
      interaction,
      { ephemeral: true }
    );
    return; // Don't call next() — blocks the command
  }

  return next();
};
