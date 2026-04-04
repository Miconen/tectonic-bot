import IsActivated from "@guards/IsActivated.js";
import IsValidTime from "@guards/IsValidTime.js";
import {
  ApplicationCommandOptionType,
  type Attachment,
  type CommandInteraction,
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
import { pbState } from "./func/pbState.js";

@Discord()
@SlashGroup("pb")
@Guard(IsValidTime("time"), IsActivated())
class varlamorepb {
  @Slash({ name: "varlamore", description: "Request your new pb to be added" })
  async varlamore(
    @SlashChoice(...bossCategories.Varlamore)
    @SlashOption({
      name: "boss",
      description: "Boss to submit time for",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    boss: string,
    @SlashOption({
      name: "time",
      description: "Varlamore specific pb time",
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
    interaction: CommandInteraction
  ) {
    const team = [interaction.user.id];

    await interaction.deferReply();
    await pbRequestHelper(
      boss,
      time,
      team,
      screenshot.url,
      interaction,
      pbState
    );
  }
}
