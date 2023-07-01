import { roleValues } from "./rankData.js";

const getRankByPoints = (points: number) => {
    const rank = [...roleValues.entries()].reverse().find(([key]) => points >= key);
    return rank ? rank[1] : [...roleValues.values()][0];
};

export { getRankByPoints };