import type {
  ButtonInteraction,
  CommandInteraction,
  TextChannel,
} from "discord.js";
import type { PbData } from "@typings/pbTypes.js";
import { getString } from "@utils/stringRepo.js";
import submitHandler from "./submitHandler.js";

const pbAcceptHelper = async (
  interaction: CommandInteraction | ButtonInteraction,
  pb: PbData
) => {
  if (!interaction.guild) return getString("errors", "noGuild");

  const channel = (await interaction.client.channels.fetch(
    pb.channel
  )) as TextChannel;
  if (!channel) return getString("errors", "channelNotFound");

  await channel.messages.fetch(pb.message);
  await channel.messages.delete(pb.message);

  // submitHandler expects a CommandInteraction for embed updates.
  // Cast is safe here — ButtonInteraction has the same guild/client/channel surface.
  const response = await submitHandler(
    pb.boss,
    pb.time,
    pb.team,
    interaction as unknown as CommandInteraction
  );

  return response;
};

export default pbAcceptHelper;
