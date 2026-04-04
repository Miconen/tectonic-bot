import type { PbData } from "@typings/pbTypes.js";
import { getString } from "@utils/stringRepo.js";
import type {
  ButtonInteraction,
  CommandInteraction,
  TextChannel,
} from "discord.js";

const pbDenyHelper = async (
  interaction: CommandInteraction | ButtonInteraction,
  pb: PbData
) => {
  const channel = (await interaction.client.channels.fetch(
    pb.channel
  )) as TextChannel;
  if (!channel) return "Channel not found";

  await channel.messages.fetch(pb.message);
  await channel.messages.delete(pb.message);

  return getString("pb", "denied", { boss: pb.boss });
};

export default pbDenyHelper;
