import type { BaseInteraction, Collection, GuildMember } from "discord.js";

interface IPointService {
	givePoints: (
		addedPoints: number | string,
		users: GuildMember | Collection<string, GuildMember>,
		interaction: BaseInteraction,
	) => Promise<string | string[]>;
}

export default IPointService;
