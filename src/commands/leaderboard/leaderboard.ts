import { Discord, Guard, Slash } from "discordx";
import type { CommandInteraction } from "discord.js";
import { RateLimit, TIME_UNIT } from "@discordx/utilities";
import leaderboardHelper from "./func/leaderboardHelper.js";

@Discord()
class Leaderboard {
	@Slash({ name: "leaderboard", description: "Check the top 50 leaderboard" })
	@Guard(RateLimit(TIME_UNIT.seconds, 60))
	leaderboard(interaction: CommandInteraction) {
		return leaderboardHelper(interaction);
	}
}
