import IsActivated from "@guards/IsActivated.js";
import IsValidTime from "@guards/IsValidTime.js";
import { notEmpty } from "@utils/notEmpty.js";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import {
  ApplicationCommandOptionType,
  type Attachment,
  type CommandInteraction,
  type GuildMember,
} from "discord.js";
import {
  Discord,
  Guard,
  Slash,
  SlashChoice,
  SlashGroup,
  SlashOption,
} from "discordx";
import bossCategories from "./func/getBosses.js";
import pbRequestHelper from "./func/pbRequestHelper.js";

@Discord()
@SlashGroup("pb")
@Guard(IsValidTime("time"), IsActivated())
class nightmarepb {
  @Slash({
    name: "nightmare",
    description: "Request your new pb to be added",
  })
  async nightmare(
    @SlashChoice(...bossCategories.Nightmare)
    @SlashOption({
      name: "boss",
      description: "Boss to submit time for",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    boss: string,
    @SlashOption({
      name: "time",
      description: "Nightmare pb time",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    time: string,
    @SlashOption({
      name: "screenshot",
      description: "Screenshot proof of the time",
      required: true,
      type: ApplicationCommandOptionType.Attachment,
    })
    screenshot: Attachment,
    @SlashOption({
      name: "player2",
      description: "Teammate discord @name",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    player2: GuildMember | null,
    @SlashOption({
      name: "player3",
      description: "Teammate discord @name",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    player3: GuildMember | null,
    @SlashOption({
      name: "player4",
      description: "Teammate discord @name",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    player4: GuildMember | null,
    @SlashOption({
      name: "player5",
      description: "Teammate discord @name",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    player5: GuildMember | null,
    interaction: CommandInteraction
  ) {
    const team = [
      interaction.user.id,
      player2?.user.id,
      player3?.user.id,
      player4?.user.id,
      player5?.user.id,
    ].filter(notEmpty);

    await interaction.deferReply();

    if (team.length > 1 && (boss === "pnm" || boss === "nm_1")) {
      return await replyHandler(
        getString("times", "soloOnlyBoss"),
        interaction,
        {
          ephemeral: true,
        }
      );
    }

    if (team.length !== 5 && boss === "nm_5") {
      return await replyHandler(
        getString("times", "invalidFiveManNightmare"),
        interaction,
        { ephemeral: true }
      );
    }

    await pbRequestHelper(boss, time, team, screenshot.url, interaction);
  }
}
