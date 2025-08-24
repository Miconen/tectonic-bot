import IsActivated from "@guards/IsActivated.js";
import IsAdmin from "@guards/IsAdmin.js";
import IsValidTime from "@guards/IsValidTime.js";
import { notEmpty } from "@utils/notEmpty.js";
import { replyHandler } from "@utils/replyHandler.js";
import {
	ApplicationCommandOptionType,
	type CommandInteraction,
	type GuildMember,
} from "discord.js";
import { Discord, Guard, Slash, SlashGroup, SlashOption } from "discordx";
import getBoss from "./func/getBoss.js";
import submitHandler from "./func/submitHandler.js";

@Discord()
@SlashGroup("pb")
@Guard(IsAdmin, IsValidTime("time"), IsActivated())
class royaltitanspb {
	@Slash({ name: "titans", description: "Request your new pb to be added" })
	async miscellaneous(
		@SlashOption({
			name: "time",
			description: "Royal Titans pb time",
			required: true,
			type: ApplicationCommandOptionType.String,
		})
		time: string,
		@SlashOption({
			name: "player",
			description: "Player discord @name",
			required: true,
			type: ApplicationCommandOptionType.User,
		})
		player: GuildMember,
		@SlashOption({
			name: "player2",
			description: "Teammate discord @name",
			required: true,
			type: ApplicationCommandOptionType.User,
		})
		player2: GuildMember,
		interaction: CommandInteraction,
	) {
		const team = [player.user.id, player2?.user.id].filter(notEmpty);

		await interaction.deferReply();
		const response = await submitHandler(
			getBoss("royal_titans", team),
			time,
			team,
			interaction,
		);
		await replyHandler(response, interaction);
	}
}
