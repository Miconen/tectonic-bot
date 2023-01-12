import { roleValues } from './rankData';

// Returns new if there is one, returns false if no rank up happened
const rankUpdater = (oldPoints: number, newPoints: number) => {
    let findFunc: (value: [number, string]) => boolean;
    if (oldPoints < newPoints) {
        findFunc = ([minPoints, role]) => oldPoints <= minPoints && newPoints > minPoints;
    } else {
        findFunc = ([minPoints, role]) => oldPoints >= minPoints && newPoints < minPoints;
    }
    const newRole = [...roleValues.entries()].find(findFunc)
    return newRole ? newRole[1] : false;
};

export { rankUpdater };