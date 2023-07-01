import teamsize from "./teamsize.js";

function getBoss(boss: string, team: (string | undefined)[]) {
    return boss + "_" + teamsize(team);
}

export default getBoss;
