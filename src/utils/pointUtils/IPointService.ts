import { StrategyResult } from "@commands/requests/strategies/strategies";
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
		interaction: CommandInteraction<"cached"> | ButtonInteraction<"cached">,
	) => Promise<StrategyResult>;
}

export default IPointService;
