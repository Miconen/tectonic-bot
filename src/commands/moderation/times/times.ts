import {
  ApplicationCommandOptionType,
  type GuildMember,
  type CommandInteraction,
} from "discord.js";
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";
import IsAdmin from "@guards/IsAdmin.js";
import { bossTimePicker } from "@pickers/bosses";
import { recordPicker } from "@pickers/records";
import { addUserToTimeHelper } from "./func/addUserToTimeHelper";
import { removeUserFromTimeHelper } from "./func/removeUserFromTimeHelper";
import { recordRemoveHelper } from "./func/recordRemoveHelper";
import initializeHelper from "@commands/moderation/times/func/initializeHelper";
import RequiresGuild from "@guards/RequiresGuild";

@Discord()
@SlashGroup({
  name: "times",
  description: "Manage times",
  root: "moderation",
})
@SlashGroup("times", "moderation")
@Guard(RequiresGuild, IsAdmin)
class Times {
  @Slash({ name: "remove", description: "Remove a specific record" })
  async remove(
    @SlashOption({
      name: "record",
      description: "Record to remove",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: recordPicker,
    })
    recordId: string,
    interaction: CommandInteraction<"cached">
  ) {
    await interaction.deferReply();
    await recordRemoveHelper(recordId, interaction);
  }

  @Slash({ name: "adduser", description: "Manually add a user to a time" })
  async adduser(
    @SlashOption({
      name: "username",
      description: "@User tag to add to a time",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    user: GuildMember,
    @SlashOption({
      name: "boss",
      description: "Boss name to add user to",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: bossTimePicker,
    })
    boss: string,
    interaction: CommandInteraction<"cached">
  ) {
    await interaction.deferReply();
    await addUserToTimeHelper(user, boss, interaction);
  }

  @Slash({
    name: "removeuser",
    description: "Manually remove a user from a time",
  })
  async removeuser(
    @SlashOption({
      name: "username",
      description: "@User tag to remove from a time",
      required: true,
      type: ApplicationCommandOptionType.User,
    })
    user: GuildMember,
    @SlashOption({
      name: "boss",
      description: "Boss name to remove user from",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: bossTimePicker,
    })
    boss: string,
    interaction: CommandInteraction<"cached">
  ) {
    await interaction.deferReply();
    await removeUserFromTimeHelper(user, boss, interaction);
  }

  @Slash({
    name: "initialize-pb-channel",
    description: "Initialize a channel for pb embeds",
  })
  @Guard(IsAdmin)
  async initialize(interaction: CommandInteraction<"cached">) {
    await initializeHelper(interaction);
  }
}
