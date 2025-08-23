import { eventPicker } from "@utils/pickers";
import {
	ApplicationCommandOptionType,
	type CommandInteraction,
} from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import { eventInfoHelper } from "./func/eventHelper";

@Discord()
@SlashGroup({ description: "Guild event information", name: "event" })
@SlashGroup("event")
class EventInfo {
	@Slash({ name: "info", description: "Get information about a past event" })
	async info(
		@SlashOption({
			name: "event",
			description: "Event to add to user",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: eventPicker,
		})
		event: string,
		interaction: CommandInteraction,
	) {
		return eventInfoHelper(event, interaction);
	}
}
