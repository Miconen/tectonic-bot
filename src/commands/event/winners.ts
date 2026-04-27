import IsAdmin from "@guards/IsAdmin";
import { notEmpty } from "@utils/notEmpty";
import {
  ApplicationCommandOptionType,
  type CommandInteraction,
} from "discord.js";
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";
import { teamPicker } from "@pickers/teams";
import { winnerHelper } from "./func/winnerHelper";
import { winnerTeamHelper } from "./func/winnerTeamHelper";
import { Requests } from "@requests/main.js";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";

@Discord()
@SlashGroup({
  description: "Create guild events",
  name: "create",
  root: "event",
})
@SlashGroup("create", "event")
@Guard(IsAdmin)
class EventCreate {
  @Slash({ name: "team", description: "Reward team event winners" })
  async team(
    @SlashOption({
      name: "competition",
      description: "ID of the WOM competition",
      required: true,
      type: ApplicationCommandOptionType.Integer,
    })
    @SlashOption({
      name: "team1",
      description: "Name of the winning team",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: teamPicker,
    })
    @SlashOption({
      name: "team2",
      description: "Name of the second team",
      required: false,
      type: ApplicationCommandOptionType.String,
      autocomplete: teamPicker,
    })
    @SlashOption({
      name: "team3",
      description: "Name of the third team",
      required: false,
      type: ApplicationCommandOptionType.String,
      autocomplete: teamPicker,
    })
    competitionId: number,
    team1: string,
    team2: string | undefined,
    team3: string | undefined,
    interaction: CommandInteraction
  ) {
    const team_names = [team1, team2, team3].filter(notEmpty);
    return winnerTeamHelper(interaction, competitionId, team_names);
  }

  @Slash({ name: "individual", description: "Reward individual event winners" })
  async individual(
    @SlashOption({
      name: "competition",
      description: "ID of the WOM competition",
      required: true,
      type: ApplicationCommandOptionType.Integer,
    })
    @SlashOption({
      name: "top",
      description: "How many placements to reward",
      type: ApplicationCommandOptionType.Integer,
      minValue: 1,
      maxValue: 3,
    })
    competitionId: number,
    top: number | undefined,
    interaction: CommandInteraction
  ) {
    return winnerHelper(interaction, competitionId, top);
  }

  @Slash({
    name: "legacy",
    description: "Register a legacy event with Discord user IDs",
  })
  async legacy(
    @SlashOption({
      name: "name",
      description: "Event name (e.g. 'Summer Bingo 2023')",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    name: string,
    @SlashOption({
      name: "winners",
      description: "Comma-separated Discord user IDs of the winners",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    winners: string,
    interaction: CommandInteraction
  ) {
    if (!interaction.guild)
      return await replyHandler(getString("errors", "noGuild"), interaction);

    await interaction.deferReply({ ephemeral: true });

    const userIds = winners
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

    if (userIds.length === 0) {
      return await replyHandler("No valid user IDs provided.", interaction, {
        ephemeral: true,
      });
    }

    const res = await Requests.registerLegacyEvent(
      interaction.guild.id,
      name,
      userIds
    );

    if (res.error) {
      return await replyHandler(
        getString("errors", "apiError", {
          activity: "registering legacy event",
          error: res.message,
        }),
        interaction,
        { ephemeral: true }
      );
    }

    const mentions = userIds.map((id) => `<@${id}>`).join(", ");
    return await replyHandler(
      `Legacy event **${name}** registered with ${userIds.length} winner${
        userIds.length > 1 ? "s" : ""
      }: ${mentions}`,
      interaction,
      { ephemeral: true }
    );
  }
}
