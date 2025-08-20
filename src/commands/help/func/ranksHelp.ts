import type IRankService from "@utils/rankUtils/IRankService";
import type { CommandInteraction } from "discord.js";

import { replyHandler } from "@utils/replyHandler";
import { container } from "tsyringe";

const ranksHelp = async (interaction: CommandInteraction) => {
	const rankService = container.resolve<IRankService>("RankService");

	const response = [];
	response.push("## Ranks:\n");
	response.push(
		`${rankService.getIcon("jade")} Jade - ${rankService.getRoleValue("jade")} points`,
	);
	response.push(
		`${rankService.getIcon("red_topaz")} Red Topaz - ${rankService.getRoleValue("red_topaz")} points`,
	);
	response.push(
		`${rankService.getIcon("sapphire")} Sapphire - ${rankService.getRoleValue("sapphire")} points`,
	);
	response.push(
		`${rankService.getIcon("emerald")} Emerald - ${rankService.getRoleValue("emerald")} points`,
	);
	response.push(
		`${rankService.getIcon("ruby")} Ruby - ${rankService.getRoleValue("ruby")} points`,
	);
	response.push(
		`${rankService.getIcon("diamond")} Diamond - ${rankService.getRoleValue("diamond")} points`,
	);
	response.push(
		`${rankService.getIcon("dragonstone")} Dragonstone - ${rankService.getRoleValue("dragonstone")} points`,
	);
	response.push(
		`${rankService.getIcon("onyx")} Onyx - ${rankService.getRoleValue("onyx")} points`,
	);
	response.push(
		`${rankService.getIcon("zenyte")} Zenyte - ${rankService.getRoleValue("zenyte")} points`,
	);
	response.push(
		`${rankService.getIcon("astral")} Astral - ${rankService.getRoleValue("astral")} points`,
	);
	response.push(
		`${rankService.getIcon("death")} Death - ${rankService.getRoleValue("death")} points`,
	);
	response.push(
		`${rankService.getIcon("blood")} Blood - ${rankService.getRoleValue("blood")} points`,
	);
	response.push(
		`${rankService.getIcon("soul")} Soul - ${rankService.getRoleValue("soul")} points`,
	);
	response.push(
		`${rankService.getIcon("wrath")} Wrath - ${rankService.getRoleValue("wrath")} points`,
	);

	await replyHandler(response.join("\n"), interaction);
};

export default ranksHelp;
