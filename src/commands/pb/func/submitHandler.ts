import type { CommandInteraction } from "discord.js";
import { Requests } from "@requests/main.js";

import TimeConverter from "./TimeConverter.js";
import updateEmbed from "./updateEmbed.js";
import { getString } from "@utils/stringRepo.js";
import giveHelper from "@commands/moderation/func/giveHelper.js";
import { getLogger } from "@logging/context.js";

async function submitHandler(
	boss: string,
	time: string,
	team: string[],
	interaction: CommandInteraction,
) {
	if (!interaction.guild) {
		return getString("errors", "noGuild");
	}
	const guildId = interaction.guild.id;
	const logger = getLogger();

	// Parse time
	const ticks = TimeConverter.timeToTicks(time);
	if (!ticks) {
		const response = getString("times", "failedParsingTicks");
		logger.error(response);
		return response;
	}

	// Add time
	const res = await Requests.newTime(guildId, {
		user_ids: team,
		time: ticks,
		boss_name: boss,
	});
	if (res.error) {
		const response = getString("times", "failedAddingTime");
		logger.error({ err: res.message }, response);
		return response;
	}

	if (res.status === 200) {
		return getString("times", "timeSubmittedNotPb");
	}

	// Pb updated
	const success = await updateEmbed(boss, interaction);
	if (!success) {
		await interaction.followUp({
			content: getString("times", "failedUpdatingEmbed"),
			ephemeral: true,
		});
	}
	logger.info(res.data, "New clan best time");

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
