import type { CommandInteraction } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import type { AutocompleteInteraction, ButtonInteraction } from "discord.js";
import {
  ButtonComponent,
  Discord,
  Guard,
  Slash,
  SlashGroup,
  SlashOption,
} from "discordx";
import IsAdmin from "@guards/IsAdmin.js";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import { formatTimeAgo } from "@utils/timeFormatter.js";
import initializeHelper from "./func/initializeHelper.js";
import { pbState } from "./func/pbState.js";
import pbAcceptHelper from "./func/pbAcceptHelper.js";
import pbDenyHelper from "./func/pbDenyHelper.js";

function autocompleter(interaction: AutocompleteInteraction) {
  const options = Array.from(pbState.entries()).map(([id, data]) => ({
    name: `${data.boss} - ${data.time} (${formatTimeAgo(data.timestamp)})`,
    value: id,
  }));

  interaction.respond(options.slice(0, 25));
}

@Discord()
@SlashGroup({
  name: "pb",
  description: "Commands for handling and requesting boss times",
})
@SlashGroup("pb")
class pb {
  @Slash({
    name: "initialize",
    description: "Initialize a channel for pb embeds",
  })
  @Guard(IsAdmin)
  async initialize(interaction: CommandInteraction) {
    await initializeHelper(interaction);
  }

  @Guard(IsAdmin)
  @ButtonComponent({ id: "pbButtonAccept" })
  async pbButtonAccept(interaction: ButtonInteraction) {
    const message = interaction.message.interactionMetadata;
    if (!message)
      return await replyHandler(
        getString("errors", "internalError"),
        interaction,
        { ephemeral: true }
      );

    const pb = pbState.get(message.id);
    if (!pb)
      return await replyHandler(
        getString("errors", "internalError"),
        interaction,
        { ephemeral: true }
      );

    const response = await pbAcceptHelper(interaction, pb);

    pbState.delete(message.id);
    return await replyHandler(response, interaction);
  }

  @Guard(IsAdmin)
  @ButtonComponent({ id: "pbButtonDeny" })
  async pbButtonDeny(interaction: ButtonInteraction) {
    const message = interaction.message.interactionMetadata;
    if (!message)
      return await replyHandler(
        getString("errors", "internalError"),
        interaction,
        { ephemeral: true }
      );

    const pb = pbState.get(message.id);
    if (!pb)
      return await replyHandler(
        getString("errors", "internalError"),
        interaction,
        { ephemeral: true }
      );

    const response = await pbDenyHelper(interaction, pb);

    pbState.delete(message.id);
    return await replyHandler(response, interaction);
  }
}

@Discord()
class PbAdmin {
  @Slash({
    name: "pb-accept",
    description: "Accept a PB request by id",
  })
  @Guard(IsAdmin)
  async pbAccept(
    @SlashOption({
      name: "id",
      description: "Id of the PB request",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: autocompleter,
    })
    id: string,
    interaction: CommandInteraction
  ) {
    const pb = pbState.get(id);
    if (!pb)
      return await replyHandler(
        getString("errors", "internalError"),
        interaction,
        { ephemeral: true }
      );

    await interaction.deferReply();
    const response = await pbAcceptHelper(interaction, pb);

    pbState.delete(id);
    return await replyHandler(response, interaction);
  }

  @Slash({
    name: "pb-deny",
    description: "Deny a PB request by id",
  })
  @Guard(IsAdmin)
  async pbDeny(
    @SlashOption({
      name: "id",
      description: "Id of the PB request",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: autocompleter,
    })
    id: string,
    interaction: CommandInteraction
  ) {
    const pb = pbState.get(id);
    if (!pb)
      return await replyHandler(
        getString("errors", "internalError"),
        interaction,
        { ephemeral: true }
      );

    const response = await pbDenyHelper(interaction, pb);

    pbState.delete(id);
    return await replyHandler(response, interaction);
  }
}
