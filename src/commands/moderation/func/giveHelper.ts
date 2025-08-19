import type { Collection, CommandInteraction, GuildMember } from "discord.js";
import type IPointService from "@utils/pointUtils/IPointService";

import { container } from "tsyringe";
import { replyHandler } from "@utils/replyHandler";

const giveHelper = async (
	target: GuildMember | Collection<string, GuildMember>,
	value: number | string,
	interaction: CommandInteraction,
) => {
	const pointService = container.resolve<IPointService>("PointService");

	// Handle giving of points, returns a string to be sent as a message.
	const res = await pointService.givePoints(value, target, interaction);
	return Array.isArray(res) ? res.join("\n") : res;
};

export default giveHelper;
