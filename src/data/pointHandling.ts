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

// TODO: Cache point multiplier instead of performing a database query each time
// Return multiplied pointReward, if ANYTHING goes wrong just return pointReward
const pointsHandler = async (points: number = 0, guild_id: string) => {
    let res = await getPointMultiplier(guild_id);
     
    if (!res[0].multiplier) return points;
    if (isNaN(res[0].multiplier) || res[0].multiplier == 0) return points;

    return points * res[0].multiplier;
}

export default pointsHandler;
export { PointRewardsMap };
