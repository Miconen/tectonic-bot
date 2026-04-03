import IsAdmin from "@guards/IsAdmin.js";
import type { CaCache, CaData } from "@typings/caTypes.js";
import { combatAchievementPicker } from "@pickers/combatAchievements";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import { formatTimeAgo } from "@utils/timeFormatter.js";
import type {
  ButtonInteraction,
  AutocompleteInteraction,
  CommandInteraction,
  GuildMember,
  Snowflake,
} from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { ButtonComponent, Discord, Guard, Slash, SlashOption } from "discordx";
import { injectable } from "tsyringe";
import acceptHelper from "./func/acceptHelper.js";
import denyHelper from "./func/denyHelper.js";
import caHelper from "./func/caHelper.js";

const state: CaCache = new Map<Snowflake, CaData>();

function autocompleter(interaction: AutocompleteInteraction) {
  const options = Array.from(state.entries()).map(([id, data]) => ({
    name: `${data.caName} - ${data.members.length} players (${formatTimeAgo(
      data.timestamp
    )})`,
    value: id,
  }));

  interaction.respond(options.slice(0, 25));
}

@Discord()
@injectable()
class CombatAchievement {
  @Slash({
    name: "ca",
    description: "Request points for completing a combat achievement together",
  })
  async ca(
    @SlashOption({
      name: "achievement",
      description: "The combat achievement completed",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: combatAchievementPicker,
    })
    achievement: string,
    @SlashOption({
      name: "player2",
      description: "Team member",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    player2: GuildMember,
    @SlashOption({
      name: "player3",
      description: "Team member",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    player3: GuildMember | undefined,
    @SlashOption({
      name: "player4",
      description: "Team member",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    player4: GuildMember | undefined,
    @SlashOption({
      name: "player5",
      description: "Team member",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    player5: GuildMember | undefined,
    @SlashOption({
      name: "player6",
      description: "Team member",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    player6: GuildMember | undefined,
    @SlashOption({
      name: "player7",
      description: "Team member",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    player7: GuildMember | undefined,
    interaction: CommandInteraction
  ) {
    if (!interaction.guild)
      return await replyHandler(getString("errors", "noGuild"), interaction);

    // Requester is always included
    const invoker = interaction.member as GuildMember;
    const members = [
      invoker,
      player2,
      player3,
      player4,
      player5,
      player6,
      player7,
    ].filter((m): m is GuildMember => m !== undefined);

    // Deduplicate by user ID
    const seen = new Set<string>();
    const uniqueMembers = members.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });

    await caHelper(achievement, uniqueMembers, interaction, state);
  }

  @Guard(IsAdmin)
  @ButtonComponent({ id: "caButtonAccept" })
  async caButtonAccept(interaction: ButtonInteraction) {
    const message = interaction.message.interactionMetadata;
    if (!message)
      return await replyHandler(
        getString("errors", "internalError"),
        interaction,
        { ephemeral: true }
      );

    const ca = state.get(message.id);
    if (!ca)
      return await replyHandler(
        getString("errors", "internalError"),
        interaction,
        { ephemeral: true }
      );

    const response = await acceptHelper(interaction, ca);

    state.delete(message.id);
    const res = Array.isArray(response) ? response.join("\n") : response;
    return await replyHandler(res, interaction);
  }

  @Guard(IsAdmin)
  @ButtonComponent({ id: "caButtonDeny" })
  async caButtonDeny(interaction: ButtonInteraction) {
    const message = interaction.message.interactionMetadata;
    if (!message)
      return await replyHandler(
        getString("errors", "internalError"),
        interaction,
        { ephemeral: true }
      );

    const ca = state.get(message.id);
    if (!ca)
      return await replyHandler(
        getString("errors", "internalError"),
        interaction,
        { ephemeral: true }
      );

    const response = await denyHelper(interaction, ca);

    state.delete(message.id);
    return await replyHandler(response, interaction);
  }

  @Slash({
    name: "ca-accept",
    description: "Accept a combat achievement request by id",
  })
  @Guard(IsAdmin)
  async caAccept(
    @SlashOption({
      name: "id",
      description: "Id of the CA request",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: autocompleter,
    })
    id: string,
    interaction: CommandInteraction
  ) {
    const ca = state.get(id);
    if (!ca)
      return await replyHandler(
        getString("errors", "internalError"),
        interaction,
        { ephemeral: true }
      );

    const response = await acceptHelper(interaction, ca);

    state.delete(id);
    const res = Array.isArray(response) ? response.join("\n") : response;
    return await replyHandler(res, interaction);
  }

  @Slash({
    name: "ca-deny",
    description: "Deny a combat achievement request by id",
  })
  @Guard(IsAdmin)
  async caDeny(
    @SlashOption({
      name: "id",
      description: "Id of the CA request",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: autocompleter,
    })
    id: string,
    interaction: CommandInteraction
  ) {
    const ca = state.get(id);
    if (!ca)
      return await replyHandler(
        getString("errors", "internalError"),
        interaction,
        { ephemeral: true }
      );

    const response = await denyHelper(interaction, ca);

    state.delete(id);
    return await replyHandler(response, interaction);
  }
}
