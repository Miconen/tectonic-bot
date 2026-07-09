import {
  ApplicationCommandOptionType,
  type CommandInteraction,
} from "discord.js";
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";
import IsAdmin from "@guards/IsAdmin.js";
import { Requests } from "@requests/main.js";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import RequiresGuild from "@guards/RequiresGuild";

@Discord()
@Guard(IsAdmin, RequiresGuild)
@SlashGroup({
  description: "Manage guild settings",
  name: "settings",
  root: "moderation",
})
@SlashGroup("settings", "moderation")
class ModerationSettings {
  @Slash({
    name: "positioncount",
    description:
      "Set how many positions (1st, 2nd, 3rd...) are tracked per boss",
  })
  async positioncount(
    @SlashOption({
      name: "count",
      description: "Number of positions to track (1-10)",
      required: true,
      type: ApplicationCommandOptionType.Integer,
      minValue: 1,
      maxValue: 10,
    })
    count: number,
    interaction: CommandInteraction<"cached">
  ) {
    const res = await Requests.updateGuild(interaction.guild.id, {
      position_count: count,
    });

    if (res.error) {
      return await replyHandler(
        getString("errors", "apiError", {
          activity: "updating position count",
          error: res.message,
        }),
        interaction
      );
    }

    return await replyHandler(
      `Position tracking updated to **${count}** position${
        count > 1 ? "s" : ""
      } per boss.`,
      interaction
    );
  }
}
