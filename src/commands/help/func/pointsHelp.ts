import type IPointService from "@utils/pointUtils/IPointService";
import { replyHandler } from "@utils/replyHandler";
import type { CommandInteraction } from "discord.js";

import { container } from "tsyringe";

const pointsHelp = async (interaction: CommandInteraction) => {
	const pointService = container.resolve<IPointService>("PointService");

	const response = [];
	response.push("**Point sources**:\n");
	response.push("**Splits**:");
	response.push(`Low value: ${pointService.pointRewards.get("split_low")}`);
	response.push(
		`Medium value: ${pointService.pointRewards.get("split_medium")}`,
	);
	response.push(`High value: ${pointService.pointRewards.get("split_high")}`);
	response.push("**Events**:");
	response.push(
		`Participation: ${pointService.pointRewards.get("event_participation")}`,
	);
	response.push(`Hosting: ${pointService.pointRewards.get("event_hosting")}`);
	response.push("**Learners**:");
	response.push(`Half: ${pointService.pointRewards.get("learner_half")}`);
	response.push(`Full: ${pointService.pointRewards.get("learner_full")}`);
	response.push("**Forum**:");
	response.push(`Bumping: ${pointService.pointRewards.get("forum_bump")}`);

	await replyHandler(response.join("\n"), interaction);
};

export default pointsHelp;
