import { awardPoints } from "@points/awardPoints";
import type {
	ButtonInteraction,
	Collection,
	CommandInteraction,
	GuildMember,
} from "discord.js";

const giveHelper = async (
	target: GuildMember | Collection<string, GuildMember>,
	value: number | string,
	interaction: CommandInteraction<"cached"> | ButtonInteraction<"cached">,
) => {
	// Handle giving of points, returns a string to be sent as a message.
	const res = await awardPoints(value, target, interaction);

	if (!res.success) return res.error;

	return Array.isArray(res.message) ? res.message.join("\n") : res.message;
};

export default giveHelper;
