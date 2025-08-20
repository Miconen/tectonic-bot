function hasDuplicates(team: (string | undefined)[]) {
	const duplicateMap: Record<string, boolean> = {};
	for (const player of team) {
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
