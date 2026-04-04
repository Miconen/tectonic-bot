import {
  ApplicationCommandOptionType,
  type CommandInteraction,
  type GuildMember,
} from "discord.js";
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";
import IsAdmin from "@guards/IsAdmin.js";
import { Requests } from "@requests/main.js";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import { caGrantPicker, caRemovePicker } from "pickers/combatAchievements";

@Discord()
@Guard(IsAdmin)
@SlashGroup({
  description: "Manage user combat achievements",
  name: "ca",
  root: "moderation",
})
@SlashGroup("ca", "moderation")
class ModerationCombatAchievements {
  @Slash({
    name: "grant",
    description: "Grant a combat achievement to a user",
  })
  @Guard(IsAdmin)
  async grant(
    @SlashOption({
      name: "username",
      description: "@User tag to target",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    user: GuildMember,
    @SlashOption({
      name: "achievement",
      description: "Combat achievement to grant",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: caGrantPicker,
    })
    achievement: string,
    interaction: CommandInteraction
  ) {
    if (!interaction.guild)
      return await replyHandler(getString("errors", "noGuild"), interaction);

    const res = await Requests.giveUserCombatAchievement(
      interaction.guild.id,
      user.id,
      achievement
    );

    if (res.error) {
      return await replyHandler(
        getString("errors", "apiError", {
          activity: "granting combat achievement",
          error: res.message,
        }),
        interaction
      );
    }

    return await replyHandler(
      getString("ca", "granted", {
        caName: achievement,
        username: user.displayName,
      }),
      interaction
    );
  }

  @Slash({
    name: "remove",
    description: "Remove a combat achievement from a user",
  })
  @Guard(IsAdmin)
  async remove(
    @SlashOption({
      name: "username",
      description: "@User tag to target",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    user: GuildMember,
    @SlashOption({
      name: "achievement",
      description: "Combat achievement to remove",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: caRemovePicker,
    })
    achievement: string,
    interaction: CommandInteraction
  ) {
    if (!interaction.guild)
      return await replyHandler(getString("errors", "noGuild"), interaction);

    const res = await Requests.removeUserCombatAchievement(
      interaction.guild.id,
      user.id,
      achievement
    );

    if (res.error) {
      return await replyHandler(
        getString("errors", "apiError", {
          activity: "removing combat achievement",
          error: res.message,
        }),
        interaction
      );
    }

    return await replyHandler(
      getString("ca", "removed", {
        caName: achievement,
        username: user.displayName,
      }),
      interaction
    );
  }
}
