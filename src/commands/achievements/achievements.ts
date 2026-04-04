import IsAdmin from "@guards/IsAdmin.js";
import type {
  AchievementCache,
  AchievementRequestData,
} from "@typings/achievementTypes.js";
import { achievementAddPicker } from "@pickers/achievements";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import { formatTimeAgo } from "@utils/timeFormatter.js";
import { ApplicationCommandOptionType } from "discord.js";
import type {
  ButtonInteraction,
  Attachment,
  AutocompleteInteraction,
  CommandInteraction,
  Snowflake,
} from "discord.js";
import { ButtonComponent, Discord, Guard, Slash, SlashOption } from "discordx";
import requestHelper from "./func/requestHelper.js";
import acceptRequestHelper from "./func/acceptRequestHelper.js";
import denyRequestHelper from "./func/denyRequestHelper.js";

const state: AchievementCache = new Map<Snowflake, AchievementRequestData>();

function autocompleter(interaction: AutocompleteInteraction) {
  const options = Array.from(state.entries()).map(([id, data]) => ({
    name: `${data.member.displayName} - ${data.achievement} (${formatTimeAgo(
      data.timestamp
    )})`,
    value: id,
  }));

  interaction.respond(options.slice(0, 25));
}

@Discord()
class Achievement {
  @Slash({
    name: "achievement",
    description: "Submit an achievement request for admin approval",
  })
  async achievement(
    @SlashOption({
      name: "achievement",
      description: "Achievement to request",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: achievementAddPicker,
    })
    achievement: string,
    @SlashOption({
      name: "screenshot",
      description: "Screenshot proof of the achievement",
      required: true,
      type: ApplicationCommandOptionType.Attachment,
    })
    screenshot: Attachment,
    interaction: CommandInteraction
  ) {
    if (!interaction.guild)
      return await replyHandler(getString("errors", "noGuild"), interaction);

    await requestHelper(achievement, screenshot.url, interaction, state);
  }

  @Guard(IsAdmin)
  @ButtonComponent({ id: "achievementButtonAccept" })
  async achievementButtonAccept(interaction: ButtonInteraction) {
    const message = interaction.message.interactionMetadata;
    if (!message)
      return await replyHandler(
        getString("errors", "internalError"),
        interaction,
        { ephemeral: true }
      );

    const request = state.get(message.id);
    if (!request)
      return await replyHandler(
        getString("errors", "internalError"),
        interaction,
        { ephemeral: true }
      );

    const response = await acceptRequestHelper(interaction, request);

    state.delete(message.id);
    return await replyHandler(response, interaction);
  }

  @Guard(IsAdmin)
  @ButtonComponent({ id: "achievementButtonDeny" })
  async achievementButtonDeny(interaction: ButtonInteraction) {
    const message = interaction.message.interactionMetadata;
    if (!message)
      return await replyHandler(
        getString("errors", "internalError"),
        interaction,
        { ephemeral: true }
      );

    const request = state.get(message.id);
    if (!request)
      return await replyHandler(
        getString("errors", "internalError"),
        interaction,
        { ephemeral: true }
      );

    const response = await denyRequestHelper(interaction, request);

    state.delete(message.id);
    return await replyHandler(response, interaction);
  }

  @Slash({
    name: "achievement-accept",
    description: "Accept an achievement request by id",
  })
  @Guard(IsAdmin)
  async achievementAccept(
    @SlashOption({
      name: "id",
      description: "Id of the achievement request",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: autocompleter,
    })
    id: string,
    interaction: CommandInteraction
  ) {
    const request = state.get(id);
    if (!request)
      return await replyHandler(
        getString("errors", "internalError"),
        interaction,
        { ephemeral: true }
      );

    const response = await acceptRequestHelper(interaction, request);

    state.delete(id);
    return await replyHandler(response, interaction);
  }

  @Slash({
    name: "achievement-deny",
    description: "Deny an achievement request by id",
  })
  @Guard(IsAdmin)
  async achievementDeny(
    @SlashOption({
      name: "id",
      description: "Id of the achievement request",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: autocompleter,
    })
    id: string,
    interaction: CommandInteraction
  ) {
    const request = state.get(id);
    if (!request)
      return await replyHandler(
        getString("errors", "internalError"),
        interaction,
        { ephemeral: true }
      );

    const response = await denyRequestHelper(interaction, request);

    state.delete(id);
    return await replyHandler(response, interaction);
  }
}
