import { getLogger } from "@logging/context";
import { Requests } from "@requests/main";
import { dumpUserData } from "@utils/dumpUserData";
import { type ArgsOf, Discord, On } from "discordx";

@Discord()
class RemoveOnLeave {
	@On({ event: "guildMemberRemove" })
	async onGuildMemberRemove([member]: ArgsOf<"guildMemberRemove">) {
		const logger = getLogger();

		const guildId = member.guild.id;
		const userId = member.user.id;

		const res = await Requests.getUser(guildId, {
			type: "user_id",
			user_id: userId,
		});

		if (res.error || !res.data) {
			logger.debug(
				{ userId, guildId },
				"Leaving member is not in database, skipping removal",
			);
			return;
		}

		try {
			await dumpUserData(
				member.client,
				guildId,
				userId,
				res.data,
				"Leaving Server",
			);
		} catch (e) {
			logger.warn(
				{ err: e, userId, guildId },
				"Failed to dump leaving user's data",
			);
		}

		const removeRes = await Requests.removeUser(guildId, {
			type: "user_id",
			user_id: userId,
		});

		if (removeRes.error) {
			logger.error(
				{ status: removeRes.status, code: removeRes.code, userId, guildId },
				"Failed to remove leaving user",
			);
		}
	}
}
