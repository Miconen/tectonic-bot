import IsAdmin from "@guards/IsAdmin";
import { eventPicker } from "@pickers/events";
import {
  ApplicationCommandOptionType,
  type CommandInteraction,
} from "discord.js";
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";
import { eventUpdateHelper } from "./func/eventUpdateHelper";
import RequiresGuild from "@guards/RequiresGuild";

@Discord()
@SlashGroup({
  description: "Manage event settings",
  name: "settings",
  root: "event",
})
@SlashGroup("settings", "event")
@Guard(IsAdmin, RequiresGuild)
class EventSettings {
  @Slash({ name: "rename", description: "Rename a guild event" })
  async rename(
    @SlashOption({
      name: "event",
      description: "Event to rename",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: eventPicker,
    })
    event: string,
    @SlashOption({
      name: "name",
      description: "New name for the event",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    name: string,
    interaction: CommandInteraction<"cached">
  ) {
    return eventUpdateHelper(event, { name }, interaction);
  }

  @Slash({ name: "cutoff", description: "Change the cutoff of a guild event" })
  async cutoff(
    @SlashOption({
      name: "event",
      description: "Event to change the cutoff of",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: eventPicker,
    })
    event: string,
    @SlashOption({
      name: "cutoff",
      description: "New cutoff value for an event",
      required: true,
      type: ApplicationCommandOptionType.Integer,
      minValue: 1,
      maxValue: 3,
    })
    position_cutoff: number,
    interaction: CommandInteraction<"cached">
  ) {
    return eventUpdateHelper(event, { position_cutoff }, interaction);
  }

  @Slash({
    name: "solo",
    description: "Change the solo flag of a guild event",
  })
  async solo(
    @SlashOption({
      name: "event",
      description: "Event to change the solo flag of",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: eventPicker,
    })
    event: string,
    @SlashOption({
      name: "solo",
      description: "New solo flag value for an event",
      required: true,
      type: ApplicationCommandOptionType.Boolean,
    })
    solo: boolean,
    interaction: CommandInteraction<"cached">
  ) {
    return eventUpdateHelper(event, { solo }, interaction);
  }
}
