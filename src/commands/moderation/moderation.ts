import type { CommandInteraction } from "discord.js";
import { Discord, Guard, Slash, SlashGroup } from "discordx";
import IsAdmin from "@guards/IsAdmin.js";
import startHelper from "./func/startHelper.js";

@Discord()
@Guard(IsAdmin)
@SlashGroup({ description: "Moderation related commands", name: "moderation" })
@SlashGroup("moderation")
class Moderation {
	@Slash({
		name: "start",
		description: "Setup command for the whole guild",
	})
	async start(interaction: CommandInteraction) {
		return startHelper(interaction);
	}
}
