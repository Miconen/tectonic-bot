function hasDuplicates(team: (string | undefined)[]) {
    let duplicateMap: Record<string, boolean> = {}
    for (let player of team) {
        if (!player) continue;
        if (!duplicateMap[player]) {
            duplicateMap[player] = true;
            continue;
        }
        return true;
    }
    return false;
}

export default hasDuplicates;
