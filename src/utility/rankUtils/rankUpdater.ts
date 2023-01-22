import {getRankByPoints} from "./getRankByPoints.js";

// Returns new if there is one, returns false if no rank up happened
const rankUpdater = (oldPoints: number, newPoints: number) => {
    const oldRank = getRankByPoints(oldPoints);
    const newRank = getRankByPoints(newPoints);
    return oldRank != newRank ? newRank : false;
};

export { rankUpdater };