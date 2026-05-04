import { pendingRequests } from "./state.js";
import { Requests } from "@requests/main.js";
import { getLogger } from "@logging/context.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type CommandInteraction,
  type TextChannel,
} from "discord.js";
import type { PendingRequest } from "@typings/requestTypes.js";

export async function postRequest(
  content: string,
  data: PendingRequest,
  interaction: CommandInteraction<"cached">
): Promise<void> {
  if (!interaction.channel) return;

  const logger = getLogger();
  const requestId = interaction.id;

  // Ensure deferred
  if (!interaction.deferred && !interaction.replied) {
    await interaction.deferReply();
  }

  const confirm = new ButtonBuilder()
    .setCustomId(`requestAccept-${requestId}`)
    .setLabel("Accept")
    .setStyle(ButtonStyle.Success);

  const deny = new ButtonBuilder()
    .setCustomId(`requestDeny-${requestId}`)
    .setLabel("Deny")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    confirm,
    deny
  );

  // Check for mod channel
  let modChannelId: string | undefined;
  try {
    const guildRes = await Requests.getGuild(interaction.guild.id);
    modChannelId = !guildRes.error ? guildRes.data.mod_channel_id : undefined;
  } catch {
    logger.warn("Failed to fetch guild config for mod channel");
  }

  data.channel = interaction.channel.id;

  if (modChannelId) {
    // User message: content + screenshot, no buttons
    const userMessage = await interaction.editReply({
      content,
      files: [data.screenshot],
    });

    data.message = userMessage.id;

    // Mod message: content + buttons + screenshot
    try {
      const modChannel = (await interaction.client.channels.fetch(
        modChannelId
      )) as TextChannel;

      if (modChannel) {
        const modMessage = await modChannel.send({
          content,
          components: [row],
          files: [data.screenshot],
        });

        data.modMessage = modMessage.id;
        data.modChannel = modChannelId;
      }
    } catch {
      logger.warn("Failed to send to mod channel, buttons on user message");
      // Fallback: add buttons to user message
      await interaction.editReply({
        content,
        components: [row],
        files: [data.screenshot],
      });
    }
  } else {
    // Fallback: buttons on user message
    const userMessage = await interaction.editReply({
      content,
      components: [row],
      files: [data.screenshot],
    });

    data.message = userMessage.id;
  }

  pendingRequests.set(requestId, data);
}
