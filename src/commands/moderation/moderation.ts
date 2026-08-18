import IsAdmin from "@guards/IsAdmin.js";
import RequiresGuild from "@guards/RequiresGuild.js";
import type { CommandInteraction } from "discord.js";
import { Discord, Guard, Slash, SlashGroup } from "discordx";
import startHelper from "./func/startHelper.js";

@Discord()
@Guard(IsAdmin, RequiresGuild)
@SlashGroup({ description: "Moderation related commands", name: "moderation" })
@SlashGroup("moderation")
class Moderation {
	@Slash({
		name: "start",
		description: "Setup command for the whole guild",
	})
	async start(interaction: CommandInteraction<"cached">) {
		await interaction.deferReply();
		return startHelper(interaction);
	}
}
