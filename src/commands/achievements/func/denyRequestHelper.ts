import type { AchievementRequestData } from "@typings/achievementTypes.js";
import { getString } from "@utils/stringRepo.js";
import type {
  ButtonInteraction,
  CommandInteraction,
  TextChannel,
} from "discord.js";

const denyRequestHelper = async (
  interaction: CommandInteraction | ButtonInteraction,
  request: AchievementRequestData
) => {
  const channel = (await interaction.client.channels.fetch(
    request.channel
  )) as TextChannel;
  if (!channel) return "Channel not found";

  await channel.messages.fetch(request.message);
  await channel.messages.delete(request.message);

  return getString("achievements", "denied", {
    username: request.member.displayName,
    achievement: request.achievement,
  });
};

export default denyRequestHelper;
