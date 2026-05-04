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

@Discord()
@SlashGroup("pb")
@Guard(IsValidTime("time"), IsActivated())
class Quest {
  @Slash({ name: "quest", description: "Request your new pb to be added" })
  async quest(
    @SlashChoice(...bossCategories["Quest Bosses"])
    @SlashOption({
      name: "boss",
      description: "Boss to submit time for",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    boss: string,
    @SlashOption({
      name: "time",
      description: "Quest pb time",
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
    await pbRequestHelper(boss, time, team, screenshot.url, interaction);
  }
}
