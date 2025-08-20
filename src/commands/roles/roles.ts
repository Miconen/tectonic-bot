import IsAdmin from "@guards/IsAdmin";
import type { CommandInteraction } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";
import { womTeamHelper } from "./func/womTeamHelper";

@Discord()
@SlashGroup({
	name: "roles",
	description: "Commands for handling and automating user roles",
})
@SlashGroup("roles")
@Guard(IsAdmin)
class pb {
	@Slash({
		name: "womteam",
		description: "Initialize roles by WOM competition teams.",
	})
	async womTeam(
		@SlashOption({
			name: "wid",
			description: "WOM competition ID",
			required: true,
			type: ApplicationCommandOptionType.Number,
		})
		wid: number,
		interaction: CommandInteraction,
	) {
		await womTeamHelper(wid, interaction);
	}
}
