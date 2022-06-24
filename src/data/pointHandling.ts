// TRY TO HAVE THIS AS THE MAIN HUB FOR ADJUSTING POINT VALUES

import getPointMultiplier from "./database/getPointMultiplier";

const PointRewardsMap = new Map<string, number>;

PointRewardsMap.set('event_participation', 5)
PointRewardsMap.set('event_hosting', 10)
PointRewardsMap.set('forum_bump', 5)
PointRewardsMap.set('pvm_learner', 5)
PointRewardsMap.set('split_low', 10)
PointRewardsMap.set('split_medium', 20)
PointRewardsMap.set('split_high', 30)

// TODO: Cache point multiplier instead of performing a database query each time
const pointsHandler = (type: string, guild_id: string) => {
    let pointReward = PointRewardsMap.get(type) ?? 0;
    let pointMultiplier = getPointMultiplier(guild_id);
    pointMultiplier.then((res: any) => {
        console.log(res);
        
        return pointReward * res[0];
    }).catch((err: any) => {
        return 0;
    })
}