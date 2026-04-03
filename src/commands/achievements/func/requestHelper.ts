import type {
  AchievementCache,
  AchievementRequestData,
} from "@typings/achievementTypes.js";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type CommandInteraction,
  type GuildMember,
} from "discord.js";

const requestHelper = async (
  achievement: string,
  screenshot: string,
  interaction: CommandInteraction,
  state: AchievementCache
) => {
  if (!interaction.channel)
    return await replyHandler(getString("errors", "noChannel"), interaction);
  if (!interaction.guild)
    return await replyHandler(getString("errors", "noGuild"), interaction);

  const confirm = new ButtonBuilder()
    .setCustomId("achievementButtonAccept")
    .setLabel("Accept")
    .setStyle(ButtonStyle.Success);

  const deny = new ButtonBuilder()
    .setCustomId("achievementButtonDeny")
    .setLabel("Deny")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    confirm,
    deny
  );

  const username = (interaction.member as GuildMember).displayName;

  await replyHandler(
    getString("achievements", "requestSubmitted", { username, achievement }),
    interaction
  );

  const message = await interaction.editReply({
    components: [row],
    files: [screenshot],
  });

  const data: AchievementRequestData = {
    member: interaction.member as GuildMember,
    achievement,
    channel: interaction.channel.id,
    message: message.id,
    timestamp: Date.now(),
  };

  state.set(interaction.id, data);
};

export default requestHelper;
