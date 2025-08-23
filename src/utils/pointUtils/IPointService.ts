import type {
	ButtonInteraction,
	Collection,
	CommandInteraction,
	GuildMember,
} from "discord.js";

interface IPointService {
	givePoints: (
		addedPoints: number | string,
		users: GuildMember | Collection<string, GuildMember>,
		interaction: CommandInteraction | ButtonInteraction,
	) => Promise<string | string[]>;
}

export default IPointService;
