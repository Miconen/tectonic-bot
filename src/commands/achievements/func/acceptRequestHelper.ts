import type {
  ButtonInteraction,
  CommandInteraction,
  TextChannel,
} from "discord.js";
import type { AchievementRequestData } from "@typings/achievementTypes.js";
import type { AchievementParam } from "@typings/requests.js";
import { Requests } from "@requests/main.js";
import { invalidateUserCache } from "@utils/pickers.js";
import { getString } from "@utils/stringRepo.js";

const acceptRequestHelper = async (
  interaction: CommandInteraction | ButtonInteraction,
  request: AchievementRequestData
) => {
  if (!interaction.guild) return getString("errors", "noGuild");

  const channel = (await interaction.client.channels.fetch(
    request.channel
  )) as TextChannel;
  if (!channel) return getString("errors", "channelNotFound");

  await channel.messages.fetch(request.message);
  await channel.messages.delete(request.message);

  const params: AchievementParam = {
    achievement: request.achievement,
    guild_id: interaction.guild.id,
    type: "user_id",
    user_id: request.member.id,
  };

  const res = await Requests.giveAchievement(params);

  if (res.status === 409) {
    return getString("achievements", "alreadyHas", {
      username: request.member.displayName,
      achievement: request.achievement,
    });
  }

  if (res.error) {
    return getString("errors", "internalError");
  }

  invalidateUserCache(interaction.guild.id, request.member.id);

  return getString("achievements", "granted", {
    achievement: request.achievement,
    username: request.member.displayName,
  });
};

export default acceptRequestHelper;
