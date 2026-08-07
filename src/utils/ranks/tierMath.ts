import type { GuildRankResponse } from "@typings/api/guildRank";

function sortedByPoints(ranks: GuildRankResponse[]): GuildRankResponse[] {
	return [...ranks].sort((a, b) => a.min_points - b.min_points);
}

/** Highest tier whose min_points <= points */
export function tierForPoints(
	points: number,
	ranks: GuildRankResponse[],
): GuildRankResponse | null {
	if (ranks.length === 0) return null;

	let best: GuildRankResponse | null = null;
	for (const r of ranks) {
		if (points >= r.min_points) {
			if (!best || r.min_points > best.min_points) best = r;
		}
	}
	return best; // null if points below every tier (or empty already handled)
}

/** Next tier above current points (strictly greater min_points) */
export function nextTier(
	points: number,
	ranks: GuildRankResponse[],
): GuildRankResponse | null {
	const sorted = sortedByPoints(ranks);
	return sorted.find((r) => r.min_points > points) ?? null;
}

/** Points still needed to reach next tier; null if none / already max */
export function pointsToNext(
	points: number,
	ranks: GuildRankResponse[],
): number | null {
	const next = nextTier(points, ranks);
	if (!next) return null;
	return next.min_points - points;
}

/** Points required to attain this tier (just min_points); null if unknown */
export function pointsForTier(
	tier: GuildRankResponse | string,
	ranks: GuildRankResponse[],
): number | null {
	if (typeof tier !== "string") return tier.min_points;

	const found = ranks.find(
		(r) => r.name === tier || r.name.toLowerCase() === tier.toLowerCase(),
	);
	return found ? found.min_points : null;
}

/**
 * Tier immediately below the one you're in (by min_points).
 * If you're between tiers, "previous" = current tier's predecessor
 * relative to tierForPoints(points).
 * null if no current tier or current is the lowest.
 */
export function previousTier(
	points: number,
	ranks: GuildRankResponse[],
): GuildRankResponse | null {
	const current = tierForPoints(points, ranks);
	if (!current) return null;

	const sorted = sortedByPoints(ranks);
	const idx = sorted.findIndex((r) => r.name === current.name);
	if (idx <= 0) return null;
	return sorted[idx - 1] ?? null;
}

/**
 * How many points above the previous tier's threshold you are.
 * Useful for “progress within band” / demotion distance.
 * null if no previous tier.
 *
 * Example: tiers 0, 100, 200; points 150 → previous is 100 → 50
 * (points - previous.min_points)
 */
export function pointsToPrevious(
	points: number,
	ranks: GuildRankResponse[],
): number | null {
	const prev = previousTier(points, ranks);
	if (!prev) return null;
	return points - prev.min_points;
}
