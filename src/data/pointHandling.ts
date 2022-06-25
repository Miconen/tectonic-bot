// TRY TO HAVE THIS AS THE MAIN HUB FOR ADJUSTING POINT VALUES

import getPointMultiplier from "./database/getPointMultiplier";

/**
 * @info object that stores all point values in one neat place for easy maintaining.
 * @get get point value for key value
 */
const PointRewardsMap = new Map<string, number>;

PointRewardsMap.set('event_participation', 5)
PointRewardsMap.set('event_hosting', 10)
PointRewardsMap.set('forum_bump', 5)
PointRewardsMap.set('pvm_learner', 5)
PointRewardsMap.set('split_low', 10)
PointRewardsMap.set('split_medium', 20)
PointRewardsMap.set('split_high', 30)

// TODO: Cache point multiplier instead of performing a database query each time
// Return multiplied pointReward, if ANYTHING goes wrong just return pointReward
const pointsHandler = (points: number, guild_id: string) => {
    let result = 0;
    let pointMultiplier = getPointMultiplier(guild_id);
    pointMultiplier.then((res: any) => {
        console.log(res);
        if (!res[0]) result = points;
        if (res[0]) result = points * res[0];
    }).catch((err: any) => {
        result = points;
    }).finally(() => {
        return result;
    })
}

export default pointsHandler;
export { PointRewardsMap };