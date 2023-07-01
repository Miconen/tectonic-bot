import { roleValues } from "./rankData.js";

const pointsToNextRank = (points: number) => {
    const nextRank = [...roleValues.entries()].find(([minPoints]) => minPoints > points);
    return nextRank ? nextRank[0] - points : -1;
};

export { pointsToNextRank };