import { eventPicker } from "@pickers/events";
import {
  ApplicationCommandOptionType,
  type CommandInteraction,
} from "discord.js";
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";
import { eventInfoHelper } from "./func/eventInfoHelper";
import { eventRemoveHelper } from "./func/eventRemover";
import RequiresGuild from "@guards/RequiresGuild";

@Discord()
@SlashGroup({ description: "Guild event information", name: "event" })
@SlashGroup("event")
@Guard(RequiresGuild)
class EventInfo {
  @Slash({ name: "info", description: "Get information about a past event" })
  async info(
    @SlashOption({
      name: "event",
      description: "Event to view",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: eventPicker,
    })
    event: string,
    interaction: CommandInteraction<"cached">
  ) {
    return eventInfoHelper(event, interaction);
  }

  @Slash({ name: "remove", description: "Remove a stored guild event." })
  async remove(
    @SlashOption({
      name: "event",
      description: "Event to remove from the guild",
      required: true,
      type: ApplicationCommandOptionType.String,
      autocomplete: eventPicker,
    })
    event: string,
    interaction: CommandInteraction<"cached">
  ) {
    return eventRemoveHelper(event, interaction);
  }
}
