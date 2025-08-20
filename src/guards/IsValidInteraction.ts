import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import type {
	ButtonInteraction,
	GuildMember,
	InteractionReplyOptions,
} from "discord.js";
import type { GuardFunction } from "discordx";
import type { SplitCache } from "../typings/splitTypes";

export function IsValidInteraction(state: SplitCache) {
	const guard: GuardFunction<ButtonInteraction> = async (
		interaction,
		_,
		next,
	) => {
		const member = interaction.member as GuildMember;
		const splitId = interaction.message.interaction?.id ?? "0";
		const split = state.get(splitId);

		console.log(
			`Checking state validity for: ${member.displayName} (${member.user.username}#${member.user.discriminator})`,
		);

		// If command has not been stored in memory, don't run.
		// Idea is not to handle commands that haven't been stored since restart.
		if (!split) {
			await replyHandler(getString("splits", "expiredRequest"), interaction);
			console.log("↳ Expired");
			return;
		}

		if (split.points === 0) {
			await replyHandler(getString("errors", "internalError"), interaction);
			console.log("↳ Failed, 0 points");
			return;
		}

		console.log("↳ Passed");
		await next();
	};

	return guard;
}

export default IsValidInteraction;
