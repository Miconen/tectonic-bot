import { Requests } from "@requests/main";
import type {
	CustomPoints,
	PresetPoints,
	PointsParam,
} from "@typings/api/points";
import { getApiErrorMessage } from "@utils/errors/api/resolver";
import {
	type ButtonInteraction,
	Collection,
	type CommandInteraction,
	type GuildMember,
} from "discord.js";
import { formatPointsAward } from "./formatPoints";
import { getRanks } from "@utils/ranks/guildRanks";
import { getString } from "@utils/stringRepo";
import { applyRankTransition } from "@utils/ranks/rankRoles";

export type StringResult =
	| { success: true; message: string }
	| { success: false; error: string };

export async function awardPoints(
	value: string | number,
	target: GuildMember | Collection<string, GuildMember>,
	interaction: CommandInteraction<"cached"> | ButtonInteraction<"cached">,
): Promise<StringResult> {
	const points =
		typeof value === "number"
			? ({ type: "custom" as const, amount: value } as CustomPoints)
			: ({ type: "preset" as const, event: value } as PresetPoints);

	const members =
		target instanceof Collection
			? target
			: new Collection<string, GuildMember>([[target.id, target]]);

	const param: PointsParam = { user_id: members.map((m) => m.id), points };

	const res = await Requests.givePointsToMultiple(interaction.guild.id, param);
	if (res.error) {
		return {
			success: false,
			error: getApiErrorMessage(res, { category: "guildErrors" }),
		};
	}

	const ranks = await getRanks(interaction.guild.id);
	const responseLines: string[] = [];

	for (const entry of res.data) {
		const member = members.get(entry.user_id);
		if (!member) {
			responseLines.push(
				getString("errors", "couldntGetUser", { userId: entry.user_id }),
			);
			continue;
		}

		const oldPoints = entry.points - entry.given_points;

		const transition = await applyRankTransition(
			member,
			ranks,
			oldPoints,
			entry.points,
		);

		responseLines.push(
			formatPointsAward(member, entry.given_points, entry.points, transition),
		);
	}

	return {
		success: true,
		message: responseLines.join("\n"),
	};
}
