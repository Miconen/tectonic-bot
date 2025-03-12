import teamsize from "./teamsize.js";

function getBoss(boss: string, team: (string | undefined)[]) {
	return boss + "_" + teamsize(team);
}

function getBossToa(boss: string, team: string[], raidlevel: number) {
	let size = team.filter(Boolean).length == 1 ? "solo" : "team";
	let invocation = raidLevelHelper(raidlevel);
	// Example return: toa_solo_400
	return `${boss}_${size}_${invocation}`;
}

function getBossCox(boss: string, team: string[]) {
	const SCALES = [1, 2, 3, 5];
	const size = teamsize(team);
	const sizeString = SCALES.includes(size) ? size : "any";
	return boss + "_" + sizeString;
}

// Round raid level down to predetermined checkpoints
function raidLevelHelper(raidlevel: number) {
	if (raidlevel < 300) {
		return "150";
	}
	if (raidlevel < 400) {
		return "300";
	}
	if (raidlevel < 500) {
		return "400";
	}
	return "500";
}

export default getBoss;
export { getBossToa, getBossCox };
