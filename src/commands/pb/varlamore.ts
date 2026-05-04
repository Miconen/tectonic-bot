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
import { Bosses } from "./func/getBosses.js";
import pbRequestHelper from "./func/pbRequestHelper.js";
import { replyHandler } from "@utils/replyHandler.js";

@Discord()
@SlashGroup("pb")
@Guard(IsActivated())
class VarlamorePb {
  @Slash({ name: "varlamore", description: "Request your new pb to be added" })
  async varlamore(
    @SlashChoice(...bossCategories.Varlamore)
    @SlashOption({
      name: "boss",
      description: "Boss to submit record for",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    boss: string,
    @SlashOption({
      name: "value",
      description: "Time (e.g. 1:23.45) or depth value (e.g. 450)",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    value: string,
    @SlashOption({
      name: "screenshot",
      description: "Screenshot proof of the record",
      required: true,
      type: ApplicationCommandOptionType.Attachment,
    })
    screenshot: Attachment,
    interaction: CommandInteraction
  ) {
    const team = [interaction.user.id];
    const bossData = Bosses.get(boss);
    const valueType = bossData?.value_type ?? "time";

    // Validate input based on value type
    if (valueType === "time") {
      // Use the same validation as IsValidTime inline
      const parts = value.split(":");
      if (parts.length < 2 || parts.length > 3) {
        return await replyHandler(
          "Invalid time format. Expected: `H:M:S`, `M:S.Ms` or `M:S`",
          interaction
        );
      }
    } else {
      // For non-time types (depth etc.), expect a positive integer
      const num = Number.parseInt(value, 10);
      if (Number.isNaN(num) || num < 1) {
        return await replyHandler(
          `Invalid value. Expected a positive number for ${valueType}.`,
          interaction
        );
      }
    }

    await interaction.deferReply();
    await pbRequestHelper(boss, value, team, screenshot.url, interaction);
  }
}
