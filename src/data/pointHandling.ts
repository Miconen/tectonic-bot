// TRY TO HAVE THIS AS THE MAIN HUB FOR ADJUSTING POINT VALUES

import getPointMultiplier from "./database/getPointMultiplier.js";

/**
 * @info object that stores all point values in one neat place for easy maintaining.
 * @get get point value for key value
 */
const PointRewardsMap = new Map<string, number>;

PointRewardsMap.set('event_participation', 5)
PointRewardsMap.set('event_hosting', 10)
PointRewardsMap.set('forum_bump', 5)
PointRewardsMap.set('learner_half', 5)
PointRewardsMap.set('learner_full', 10)
PointRewardsMap.set('split_low', 10)
PointRewardsMap.set('split_medium', 20)
PointRewardsMap.set('split_high', 30)

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

export default pointsHandler;
export { PointRewardsMap };
