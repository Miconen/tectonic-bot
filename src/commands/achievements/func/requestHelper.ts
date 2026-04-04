import type { AchievementRequest } from "@typings/requestTypes.js";
import { postRequest } from "@commands/requests/postRequest.js";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import type { CommandInteraction, GuildMember } from "discord.js";

const requestHelper = async (
  achievement: string,
  screenshot: string,
  interaction: CommandInteraction
) => {
  if (!interaction.channel)
    return await replyHandler(getString("errors", "noChannel"), interaction);
  if (!interaction.guild)
    return await replyHandler(getString("errors", "noGuild"), interaction);

  const username = (interaction.member as GuildMember).displayName;
  const content = getString("achievements", "requestSubmitted", {
    username,
    achievement,
  });

  const data: AchievementRequest = {
    type: "achievement",
    member: interaction.member as GuildMember,
    achievement,
    screenshot,
    timestamp: Date.now(),
    channel: "",
    message: "",
  };

  await postRequest(content, data, interaction);
};

export default requestHelper;
