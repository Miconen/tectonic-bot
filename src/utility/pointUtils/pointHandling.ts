import getPointMultiplier from "../../database/getPointMultiplier.js";

let pointMultiplierCache: Map<string, number> = new Map();

const pointsHandler = async (points: number = 0, guild_id: string) => {
    // Check if the multiplier is already cached
    if (pointMultiplierCache.has(guild_id)) {
        let cachedMultiplier = pointMultiplierCache.get(guild_id);
        if (!cachedMultiplier) return points;
        return points * cachedMultiplier;
    }

    let res = await getPointMultiplier(guild_id);
    if (!res) return points;
    if (isNaN(res) || res == 0) return points;

    pointMultiplierCache.set(guild_id, res);
    return points * res;
}

export { pointsHandler };