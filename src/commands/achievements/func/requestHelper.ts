import type { AchievementRequest } from "@typings/requestTypes.js";
import { pendingRequests } from "@commands/requests/state.js";
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
  interaction: CommandInteraction
) => {
  if (!interaction.channel)
    return await replyHandler(getString("errors", "noChannel"), interaction);
  if (!interaction.guild)
    return await replyHandler(getString("errors", "noGuild"), interaction);

  const confirm = new ButtonBuilder()
    .setCustomId("requestAccept")
    .setLabel("Accept")
    .setStyle(ButtonStyle.Success);

  const deny = new ButtonBuilder()
    .setCustomId("requestDeny")
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

  const data: AchievementRequest = {
    type: "achievement",
    member: interaction.member as GuildMember,
    achievement,
    channel: interaction.channel.id,
    message: message.id,
    screenshot,
    timestamp: Date.now(),
  };

  pendingRequests.set(interaction.id, data);
};

export default requestHelper;
