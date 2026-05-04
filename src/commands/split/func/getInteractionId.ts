import { getLogger } from "@logging/context";
import type { ButtonInteraction } from "discord.js";

const getInteractionId = (interaction: ButtonInteraction) => {
  const logger = getLogger();
  const iid = interaction.message.interactionMetadata?.id;
  if (!iid) logger.error("Interaction ID not found from metadata");
  return iid ?? "0";
};

export default getInteractionId;
