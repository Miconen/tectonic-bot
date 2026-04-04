import {
  ApplicationCommandOptionType,
  ChannelType,
  type CommandInteraction,
  type TextChannel,
} from "discord.js";
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";
import IsAdmin from "@guards/IsAdmin.js";
import { Requests } from "@requests/main.js";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";

@Discord()
@SlashGroup("moderation")
@Guard(IsAdmin)
class ModChannel {
  @Slash({
    name: "modchannel",
    description: "Set the moderation channel for approval requests",
  })
  async modchannel(
    @SlashOption({
      name: "channel",
      description: "Channel for approval requests",
      required: true,
      type: ApplicationCommandOptionType.Channel,
      channelTypes: [ChannelType.GuildText],
    })
    channel: TextChannel,
    interaction: CommandInteraction
  ) {
    if (!interaction.guild)
      return await replyHandler(getString("errors", "noGuild"), interaction);

    const res = await Requests.updateGuild(interaction.guild.id, {
      mod_channel: channel.id,
    });

    if (res.error) {
      return await replyHandler(
        getString("errors", "apiError", {
          activity: "setting moderation channel",
          error: res.message,
        }),
        interaction,
        { ephemeral: true }
      );
    }

    return await replyHandler(
      getString("moderation", "modChannelSet", { channel: `<#${channel.id}>` }),
      interaction,
      { ephemeral: true }
    );
  }
}
