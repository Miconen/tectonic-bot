import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import {
  ApplicationCommandOptionType,
  type Attachment,
  type CommandInteraction,
} from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { achievementAddPicker } from "@pickers/achievements";
import requestHelper from "./func/requestHelper.js";

@Discord()
class Achievement {
  @Slash({
    name: "request",
    description: "Submit an achievement request for admin approval",
  })
  async request(
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
