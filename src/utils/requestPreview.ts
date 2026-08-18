import { Requests } from "@requests/main.js";
import type { GuildMember } from "discord.js";
import { formatDisplayName } from "./formatDisplayName";
import { getRanks } from "./ranks/guildRanks";
import { getRankTransition } from "./ranks/rankRoles";

export async function buildPlayerPreview(
	guildId: string,
	members: GuildMember[],
	points: number,
): Promise<string> {
	const userIds = members.map((m) => m.id);
	const res = await Requests.getUsers(guildId, {
		type: "user_id",
		user_id: userIds,
	});

	const lines: string[] = ["**If approved:**"];

	const ranks = await getRanks(guildId);
	for (const member of members) {
		const userData = !res.error
			? res.data.find((u) => u.user_id === member.id)
			: undefined;

		if (!userData) {
			lines.push(`<@${member.id}>`);
			continue;
		}

		const oldPoints = userData.points;
		const newPoints = oldPoints + points;

		const transition = getRankTransition(ranks, oldPoints, newPoints);

		let line = `<@${member.id}> (${oldPoints} ${transition.oldTier?.icon ?? ""} → ${newPoints} ${transition.newTier?.icon ?? ""})`;
		if (transition.rankChanged) {
			const direction = points >= 0 ? "Ranks up" : "Ranks down";
			line += ` ${direction} to ${transition.newTier?.icon ?? ""} ${formatDisplayName(transition.newTier?.name ?? "Unranked")}`;
		}
		lines.push(line);
	}

	return lines.join("\n");
}
