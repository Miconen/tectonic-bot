import IsAdmin from "@guards/IsAdmin.js";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import { formatTimeAgo } from "@utils/timeFormatter.js";
import {
  ApplicationCommandOptionType,
  ButtonInteraction,
  type AutocompleteInteraction,
  type CommandInteraction,
  type TextChannel,
} from "discord.js";
import { ButtonComponent, Discord, Guard, Slash, SlashOption } from "discordx";
import { pendingRequests } from "./state.js";
import { getStrategy } from "./strategies/strategies.js";
import RequiresGuild from "@guards/RequiresGuild.js";

function autocompleter(interaction: AutocompleteInteraction) {
  const options = Array.from(pendingRequests.entries()).map(([id, data]) => ({
    name: `${getStrategy(data).label(data)} (${formatTimeAgo(data.timestamp)})`,
    value: id,
  }));
  interaction.respond(options.slice(0, 25));
}

async function editUserMessage(
  interaction: ButtonInteraction<"cached"> | CommandInteraction<"cached">,
  channelId: string,
  messageId: string,
  content: string
) {
  try {
    const channel = (await interaction.client.channels.fetch(
      channelId
    )) as TextChannel;
    if (!channel) return;
    const message = await channel.messages.fetch(messageId);
    await message.edit({ content, components: [] });
  } catch {}
}

async function deleteModMessage(
  interaction: ButtonInteraction<"cached"> | CommandInteraction<"cached">,
  modChannel?: string,
  modMessage?: string
) {
  if (!modMessage || !modChannel) return;
  try {
    if (
      interaction instanceof ButtonInteraction &&
      interaction.message.id === modMessage
    ) {
      await interaction.message.delete();
    } else {
      const channel = (await interaction.client.channels.fetch(
        modChannel
      )) as TextChannel;
      if (!channel) return;
      const msg = await channel.messages.fetch(modMessage);
      await msg.delete();
    }
  } catch {}
}

function messageLink(guildId: string, channelId: string, messageId: string) {
  return `https://discord.com/channels/${guildId}/${channelId}/${messageId}`;
}

async function handleAccept(
  interaction: ButtonInteraction<"cached"> | CommandInteraction<"cached">,
  requestId: string
) {
  const data = pendingRequests.get(requestId);
  if (!data) {
    return await replyHandler(
      getString("errors", "internalError"),
      interaction,
      { ephemeral: true }
    );
  }

  if (!interaction.deferred && !interaction.replied) {
    await interaction.deferReply({ ephemeral: true });
  }

  // Delete mod message if exists
  await deleteModMessage(interaction, data.modChannel, data.modMessage);

  // Run strategy
  const strategy = getStrategy(data);
  const response = await strategy.accept(interaction, data);
  const content = Array.isArray(response) ? response.join("\n") : response;

  // Edit user-facing message with result (screenshot already attached)
  await editUserMessage(interaction, data.channel, data.message, content);

  pendingRequests.delete(requestId);

  // Ephemeral link to result
  const link = messageLink(
    interaction.guildId ?? "",
    data.channel,
    data.message
  );
  await interaction.editReply({
    content: `✔ Request approved. [Jump to message](${link})`,
  });
}

async function handleDeny(
  interaction: ButtonInteraction<"cached"> | CommandInteraction<"cached">,
  requestId: string
) {
  const data = pendingRequests.get(requestId);
  if (!data) {
    return await replyHandler(
      getString("errors", "internalError"),
      interaction,
      { ephemeral: true }
    );
  }

  if (!interaction.deferred && !interaction.replied) {
    await interaction.deferReply({ ephemeral: true });
  }

  // Delete mod message if exists
  await deleteModMessage(interaction, data.modChannel, data.modMessage);

  // Edit user-facing message with deny
  const strategy = getStrategy(data);
  const content = strategy.denyMessage(data);
  await editUserMessage(interaction, data.channel, data.message, content);

  pendingRequests.delete(requestId);

  // Ephemeral link
  const link = messageLink(
    interaction.guildId ?? "",
    data.channel,
    data.message
  );
  await interaction.editReply({
    content: `❌ Request denied. [Jump to message](${link})`,
  });
}

@Discord()
@Guard(RequiresGuild)
class RequestHandler {
  @Guard(IsAdmin)
  @ButtonComponent({ id: /^requestAccept-/ })
  async buttonAccept(interaction: ButtonInteraction<"cached">) {
    const requestId = interaction.customId.replace("requestAccept-", "");
    return handleAccept(interaction, requestId);
  }

  @Guard(IsAdmin)
  @ButtonComponent({ id: /^requestDeny-/ })
  async buttonDeny(interaction: ButtonInteraction<"cached">) {
    const requestId = interaction.customId.replace("requestDeny-", "");
    return handleDeny(interaction, requestId);
  }

  @Slash({ name: "accept", description: "Accept a pending request by id" })
  @Guard(IsAdmin)
  async accept(
    @SlashOption({
      name: "id",
      description: "Id of the pending request",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: autocompleter,
    })
    id: string,
    interaction: CommandInteraction<"cached">
  ) {
    return handleAccept(interaction, id);
  }

  @Slash({ name: "deny", description: "Deny a pending request by id" })
  @Guard(IsAdmin)
  async deny(
    @SlashOption({
      name: "id",
      description: "Id of the pending request",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: autocompleter,
    })
    id: string,
    interaction: CommandInteraction<"cached">
  ) {
    return handleDeny(interaction, id);
  }
}
