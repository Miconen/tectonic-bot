import { RateLimit, TIME_UNIT } from "@discordx/utilities";
import RequiresGuild from "@guards/RequiresGuild.js";
import type { CommandInteraction } from "discord.js";
import { Discord, Guard, Slash } from "discordx";
import leaderboardHelper from "./func/leaderboardHelper.js";

@Discord()
@Guard(RequiresGuild)
class Leaderboard {
	@Slash({ name: "leaderboard", description: "Check the top 50 leaderboard" })
	@Guard(RateLimit(TIME_UNIT.seconds, 60))
	async leaderboard(interaction: CommandInteraction<"cached">) {
		await interaction.deferReply();
		return leaderboardHelper(interaction);
	}
}
