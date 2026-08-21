import RequiresGuild from "@guards/RequiresGuild.js";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import type { CommandInteraction } from "discord.js";
import { Discord, Guard, Slash, SlashGroup } from "discordx";
import pointsHelp from "./func/pointsHelp.js";
import ranksHelp from "./func/ranksHelp.js";
import splitHelp from "./func/splitHelp.js";
import { safeDefer } from "@utils/safeDefer.js";

@Discord()
@SlashGroup({ name: "help", description: "Commands to help you use commands" })
@SlashGroup("help")
@Guard(RequiresGuild)
class Help {
	@Slash({
		name: "commands",
		description: "Information about all commands",
	})
	async commands(interaction: CommandInteraction<"cached">) {
		await safeDefer(interaction);
		await replyHandler(getString("help", "commandsInfo"), interaction);
	}

	@Slash({
		name: "ranks",
		description: "Information about all the ranks",
	})
	async ranks(interaction: CommandInteraction<"cached">) {
		await safeDefer(interaction);
		return ranksHelp(interaction);
	}

	@Slash({
		name: "points",
		description: "Information about points",
	})
	async points(interaction: CommandInteraction<"cached">) {
		await safeDefer(interaction);
		return pointsHelp(interaction);
	}

	@Slash({ name: "split", description: "Information about splitting" })
	async split(interaction: CommandInteraction<"cached">) {
		await safeDefer(interaction);
		return splitHelp(interaction);
	}
}
