import { eventPicker } from "@utils/pickers";
import {
	ApplicationCommandOptionType,
	type CommandInteraction,
} from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import { eventInfoHelper } from "./func/eventInfoHelper";
import { eventUpdateHelper } from "./func/eventUpdateHelper";

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
		interaction: CommandInteraction,
	) {
		return eventUpdateHelper(event, { name }, interaction);
	}

	@Slash({ name: "cutoff", description: "Change the cutoff of a guild event." })
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
		interaction: CommandInteraction,
	) {
		return eventUpdateHelper(event, { position_cutoff }, interaction);
	}

	@Slash({ name: "solo", description: "Change the solo flag of a guild event." })
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
		interaction: CommandInteraction,
	) {
		return eventUpdateHelper(event, { solo }, interaction);
	}
}
