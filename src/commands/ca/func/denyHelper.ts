import type { CaData } from "@typings/caTypes";
import { getString } from "@utils/stringRepo";
import type {
  ButtonInteraction,
  CommandInteraction,
  TextChannel,
} from "discord.js";

const denyHelper = async (
  interaction: CommandInteraction | ButtonInteraction,
  ca: CaData
) => {
  const channel = (await interaction.client.channels.fetch(
    ca.channel
  )) as TextChannel;
  if (!channel) return "Channel not found";

  await channel.messages.fetch(ca.message);
  await channel.messages.delete(ca.message);

  return getString("ca", "denied", { caName: ca.caName });
};

export default denyHelper;
