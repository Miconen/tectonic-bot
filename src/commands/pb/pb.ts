import type { CommandInteraction } from "discord.js";
import { Discord, Guard, Slash, SlashGroup } from "discordx";
import IsAdmin from "@guards/IsAdmin.js";
import initializeHelper from "./func/initializeHelper.js";

@Discord()
@SlashGroup({
  name: "pb",
  description: "Commands for handling and requesting boss times",
})
@SlashGroup("pb")
class pb {
  @Slash({
    name: "initialize",
    description: "Initialize a channel for pb embeds",
  })
  @Guard(IsAdmin)
  async initialize(interaction: CommandInteraction) {
    await initializeHelper(interaction);
  }
}
