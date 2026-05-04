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
import RequiresGuild from "@guards/RequiresGuild.js";

@Discord()
@SlashGroup("pb")
@Guard(RequiresGuild, IsValidTime("time"), IsActivated())
class MiscellaneousPb {
  @Slash({
    name: "miscellaneous",
    description: "Request your new pb to be added",
  })
  async miscellaneous(
    @SlashChoice(...bossCategories.Miscellaneous)
    @SlashOption({
      name: "boss",
      description: "Boss to submit time for",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    boss: string,
    @SlashOption({
      name: "time",
      description: "Miscellaneous boss pb time",
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
    interaction: CommandInteraction<"cached">
  ) {
    const team = [interaction.user.id];

    await interaction.deferReply();
    await pbRequestHelper(boss, time, team, screenshot.url, interaction);
  }
}
