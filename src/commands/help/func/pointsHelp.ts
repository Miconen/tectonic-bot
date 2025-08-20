import { getPoints } from "@utils/pointSources";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import type { CommandInteraction } from "discord.js";

const pointsHelp = async (interaction: CommandInteraction) => {
	if (!interaction.guild)
		return await replyHandler(getString("errors", "noGuild"), interaction);

	const response = [];
	response.push("**Point sources**:\n");
	response.push("**Splits**:");
	response.push(
		`Low value: ${await getPoints("split_low", interaction.guild.id)}`,
	);
	response.push(
		`Medium value: ${await getPoints("split_medium", interaction.guild.id)}`,
	);
	response.push(
		`High value: ${await getPoints("split_high", interaction.guild.id)}`,
	);
	response.push("**Events**:");
	response.push(
		`Participation: ${await getPoints("event_participation", interaction.guild.id)}`,
	);
	response.push(
		`Hosting: ${await getPoints("event_hosting", interaction.guild.id)}`,
	);
	response.push("**Learners**:");
	response.push(
		`Half: ${await getPoints("learner_half", interaction.guild.id)}`,
	);
	response.push(
		`Full: ${await getPoints("learner_full", interaction.guild.id)}`,
	);
	response.push("**Forum**:");
	response.push(
		`Bumping: ${await getPoints("forum_bump", interaction.guild.id)}`,
	);

	await replyHandler(response.join("\n"), interaction);
};

export default pointsHelp;
