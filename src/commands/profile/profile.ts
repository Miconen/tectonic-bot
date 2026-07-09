import RequiresGuild from "@guards/RequiresGuild.js";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import {
  ApplicationCommandOptionType,
  type CommandInteraction,
  type GuildMember,
} from "discord.js";
import { Discord, Guard, Slash, SlashOption } from "discordx";
import profileHelper from "./func/profileHelper.js";

@Discord()
@Guard(RequiresGuild)
class Profile {
  @Slash({
    name: "profile",
    description: "Check your or someone elses profile",
  })
  async points(
    @SlashOption({
      name: "username",
      description:
        "Leave blank to check personal profile or supply a name to check another user.",
      required: false,
      type: ApplicationCommandOptionType.User,
    })
    user: GuildMember | null,
    @SlashOption({
      name: "rsn",
      description: "RSN connected to the user profile.",
      required: false,
      type: ApplicationCommandOptionType.String,
    })
    rsn: string | null,
    interaction: CommandInteraction<"cached">
  ) {
    if (user && rsn) {
      return await replyHandler(
        getString("validation", "conflictingParams", {
          param1: "username",
          param2: "rsn",
        }),
        interaction,
        { ephemeral: true }
      );
    }

    const response = await profileHelper(user, rsn, interaction);
    await interaction.reply(response);
  }
}
