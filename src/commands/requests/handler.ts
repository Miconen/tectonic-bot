import IsAdmin from "@guards/IsAdmin.js";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import { formatTimeAgo } from "@utils/timeFormatter.js";
import {
  ApplicationCommandOptionType,
  type ButtonInteraction,
  type AutocompleteInteraction,
  type CommandInteraction,
  type TextChannel,
} from "discord.js";
import { ButtonComponent, Discord, Guard, Slash, SlashOption } from "discordx";
import { pendingRequests } from "./state.js";
import { getStrategy } from "./strategies/strategies.js";

function autocompleter(interaction: AutocompleteInteraction) {
  const options = Array.from(pendingRequests.entries()).map(([id, data]) => ({
    name: `${getStrategy(data).label(data)} (${formatTimeAgo(data.timestamp)})`,
    value: id,
  }));
  interaction.respond(options.slice(0, 25));
}

async function deleteOriginalMessage(
  interaction: ButtonInteraction | CommandInteraction,
  channelId: string,
  messageId: string
) {
  try {
    const channel = (await interaction.client.channels.fetch(
      channelId
    )) as TextChannel;
    if (!channel) return;
    const message = await channel.messages.fetch(messageId);
    await message.delete();
  } catch {}
}

async function handleAccept(
  interaction: ButtonInteraction | CommandInteraction,
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
    await interaction.deferReply();
  }

  await deleteOriginalMessage(interaction, data.channel, data.message);

  const strategy = getStrategy(data);
  const response = await strategy.accept(interaction, data);
  const content = Array.isArray(response) ? response.join("\n") : response;

  pendingRequests.delete(requestId);

  await interaction.editReply({
    content,
    ...(data.screenshot ? { files: [data.screenshot] } : {}),
  });
}

async function handleDeny(
  interaction: ButtonInteraction | CommandInteraction,
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

  await deleteOriginalMessage(interaction, data.channel, data.message);

  const strategy = getStrategy(data);
  const content = strategy.denyMessage(data);

  pendingRequests.delete(requestId);

  return await replyHandler(content, interaction);
}

@Discord()
class RequestHandler {
  @Guard(IsAdmin)
  @ButtonComponent({ id: "requestAccept" })
  async buttonAccept(interaction: ButtonInteraction) {
    const id = interaction.message.interactionMetadata?.id;
    if (!id) {
      return await replyHandler(
        getString("errors", "internalError"),
        interaction,
        { ephemeral: true }
      );
    }
    return handleAccept(interaction, id);
  }

  @Guard(IsAdmin)
  @ButtonComponent({ id: "requestDeny" })
  async buttonDeny(interaction: ButtonInteraction) {
    const id = interaction.message.interactionMetadata?.id;
    if (!id) {
      return await replyHandler(
        getString("errors", "internalError"),
        interaction,
        { ephemeral: true }
      );
    }
    return handleDeny(interaction, id);
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
    interaction: CommandInteraction
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
    interaction: CommandInteraction
  ) {
    return handleDeny(interaction, id);
  }
}
