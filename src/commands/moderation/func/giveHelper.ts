import type IPointService from "@utils/pointUtils/IPointService";
import type {
	ButtonInteraction,
	Collection,
	CommandInteraction,
	GuildMember,
} from "discord.js";

import { container } from "tsyringe";

const giveHelper = async (
	target: GuildMember | Collection<string, GuildMember>,
	value: number | string,
	interaction: CommandInteraction<"cached"> | ButtonInteraction<"cached">,
) => {
	const pointService = container.resolve<IPointService>("PointService");

	// Handle giving of points, returns a string to be sent as a message.
	const res = await pointService.givePoints(value, target, interaction);

	if (!res.success) return res.error;

	return Array.isArray(res.message) ? res.message.join("\n") : res.message;
};

export default giveHelper;
