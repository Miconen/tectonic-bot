import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import {
  ApplicationCommandOptionType,
  type Attachment,
  type CommandInteraction,
} from "discord.js";
import { Discord, Guard, Slash, SlashOption } from "discordx";
import { achievementAddPicker } from "@pickers/achievements";
import requestHelper from "./func/requestHelper.js";
import IsActivated from "@guards/IsActivated.js";

@Discord()
@Guard(IsActivated())
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

    await requestHelper(achievement, screenshot.url, interaction);
  }
}
