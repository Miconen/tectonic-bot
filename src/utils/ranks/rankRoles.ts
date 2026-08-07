// rankRoles.ts
import type { GuildMember } from "discord.js";
import type { GuildRankResponse } from "@typings/api/guildRank";
import { getLogger } from "@logging/context";

/** All Discord role IDs configured on guild ranks */
export function rankRoleIds(ranks: GuildRankResponse[]): string[] {
	return ranks.map((r) => r.role_id).filter((id): id is string => !!id);
}

/**
 * Remove every rank role, then add the new tier's role (if any).
 * No-op when ranks have no role_ids.
 * Returns null-ish success; throws only on Discord API failures you don't catch.
 */
export async function syncRankRoles(
	member: GuildMember,
	ranks: GuildRankResponse[],
	newTier: GuildRankResponse | null,
): Promise<void> {
	const logger = getLogger();
	const ids = rankRoleIds(ranks);
	if (ids.length === 0) return;

	const toRemove = ids.filter((id) => member.roles.cache.has(id));
	if (toRemove.length) {
		await member.roles.remove(toRemove);
	}

	if (newTier?.role_id) {
		await member.roles.add(newTier.role_id);
		logger.info(
			{ user: member.id, role: newTier.role_id, tier: newTier.name },
			"Assigned rank role",
		);
	}
}

/** On points change: only touch roles if tier name changed */
export async function syncRankRolesIfChanged(
	member: GuildMember,
	ranks: GuildRankResponse[],
	oldPoints: number,
	newPoints: number,
	tierForPoints: (
		p: number,
		r: GuildRankResponse[],
	) => GuildRankResponse | null,
): Promise<GuildRankResponse | null> {
	const oldTier = tierForPoints(oldPoints, ranks);
	const newTier = tierForPoints(newPoints, ranks);

	if (oldTier?.name === newTier?.name) return null; // no rank change

	await syncRankRoles(member, ranks, newTier);
	return newTier; // caller can use for "ranked up to X" messages
}
