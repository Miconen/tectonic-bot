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
class SepulchrePb {
  @Slash({
    name: "sepulchre",
    description: "Request your new pb to be added",
  })
  async sepulchre(
    @SlashChoice(...bossCategories.Sepulchre)
    @SlashOption({
      name: "floor",
      description: "Floor to submit time for",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    floor: string,
    @SlashOption({
      name: "time",
      description: "Hallowed Sepulchre pb time",
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
    await pbRequestHelper(floor, time, team, screenshot.url, interaction);
  }
}
