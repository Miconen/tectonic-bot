import { CommandInteraction } from "discord.js";
import type IPointService from "@utils/pointUtils/IPointService";

import { container } from "tsyringe";

const pointsHelp = async (interaction: CommandInteraction) => {
	const pointService = container.resolve<IPointService>("PointService");

	let response =
		`**Point sources**:\n\n` +
		`**Splits**:\n` +
		`Low value: ${pointService.pointRewards.get("split_low")}\n` +
		`Medium value: ${pointService.pointRewards.get("split_medium")}\n` +
		`High value: ${pointService.pointRewards.get("split_high")}` +
		`\n\n` +
		`**Events**:\n` +
		`Participation: ${pointService.pointRewards.get("event_participation")}\n` +
		`Hosting: ${pointService.pointRewards.get("event_hosting")}` +
		`\n\n` +
		`**Learners**:\n` +
		`Half: ${pointService.pointRewards.get("learner_half")}\n` +
		`Full: ${pointService.pointRewards.get("learner_full")}` +
		`\n\n` +
		`**Forum**:\n` +
		`Bumping: ${pointService.pointRewards.get("forum_bump")}`;

	await interaction.reply(response);
};

export default pointsHelp;
