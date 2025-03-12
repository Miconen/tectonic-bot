import hasDuplicates from "./hasDuplicates.js";
import { Requests } from "@requests/main.js";

async function addTime(
	ticks: number,
	boss: string,
	team: (string | undefined)[],
	guildId: string,
) {
	if (team.filter((player) => player).length == 0) return;
	if (hasDuplicates(team)) return;

	const user_ids: string[] = [];
	for (let teammate of team) {
		if (!teammate) continue;
		user_ids.push(teammate);
	}

	const time = await Requests.newTime(guildId, {
		user_ids,
		time: ticks,
		boss_name: boss,
	});

	// TODO: Return proper format
	return {
		time,
	};
}

export default addTime;
