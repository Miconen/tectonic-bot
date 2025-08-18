import type { BaseInteraction, Collection, GuildMember } from "discord.js";

interface IPointService {
	givePoints: (
		addedPoints: number,
		users: GuildMember,
		interaction: BaseInteraction,
	) => Promise<string>;
	givePointsToMultiple: (
		addedPoints: number,
		users: Collection<string, GuildMember>,
		interaction: BaseInteraction,
		extraPoints?: { [key: string]: number },
	) => Promise<string[]>;
}

export default IPointService;
