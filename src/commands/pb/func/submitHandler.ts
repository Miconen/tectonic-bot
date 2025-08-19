import type { CommandInteraction } from "discord.js";
import { Requests } from "@requests/main.js";

import TimeConverter from "./TimeConverter.js";
import updateEmbed from "./updateEmbed.js";
import { getString } from "@utils/stringRepo.js";
import giveHelper from "@commands/moderation/func/giveHelper.js";
import { Bosses } from "./getBosses.js";

async function submitHandler(
	boss: string,
	time: string,
	team: string[],
	interaction: CommandInteraction,
) {
	console.log(`Submitting pb: ${boss} ${time}`);
	if (!interaction.guild) {
		console.log("↳ Failed getting guild");
		return getString("errors", "noGuild");
	}
	const guildId = interaction.guild.id;

	// Parse time
	const ticks = TimeConverter.timeToTicks(time);
	if (!ticks) {
		console.log("↳ Failed parsing ticks from time");
		return getString("times", "failedParsingTicks");
	}

	// Add time
	const res = await Requests.newTime(guildId, {
		user_ids: team,
		time: ticks,
		boss_name: boss,
	});
	if (res.error) {
		console.log("↳ Failed adding time", res.message);
		return getString("times", "failedAddingTime");
	}

	console.log("↳ Time added");

	if (res.status === 200) {
		console.log("↳ Not a new pb");
		return getString("times", "timeSubmittedNotPb");
	}

	// Pb updated
	await updateEmbed(boss, guildId, interaction);
	console.log(
		`↳ New pb: ${TimeConverter.ticksToTime(res.data.time)} (${res.data.time} ticks)\nBeating the old time ${TimeConverter.ticksToTime(res.data.time_old)} (${res.data.time_old} ticks)`,
	);

	// Fetch and map user ids to GuildMember types
	const members = await interaction.guild.members.fetch({ user: team });
	const pointsResponses: string[] = [];

	if (!members) {
		pointsResponses.push(getString("times", "errorFetchingUsersForPoints"));
	}

	// Give points
	pointsResponses.push(await giveHelper(members, "clan_pb", interaction));

	// Construct response
	const response: string[] = [
		getString("times", "newPb", {
			time: TimeConverter.ticksToTime(res.data.time),
			ticks: res.data.time,
		}),
	];
	response.push(pointsResponses.join("\n"));

	return response.join("\n");
}

export default submitHandler;
