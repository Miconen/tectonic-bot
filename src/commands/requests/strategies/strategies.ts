import type { BaseRequest, PendingRequest } from "@typings/requestTypes.js";
import type { ButtonInteraction, CommandInteraction } from "discord.js";
import { achievementStrategy } from "./achievement";
import { caStrategy } from "./ca";
import { pbStrategy } from "./pb";
import { splitStrategy } from "./split";

type Interaction = ButtonInteraction<"cached"> | CommandInteraction<"cached">;

export type StrategyResult =
	| { success: true; message: string | string[] }
	| { success: false; error: string };

export interface RequestStrategy<T extends BaseRequest> {
	accept(interaction: Interaction, data: T): Promise<StrategyResult>;
	denyMessage(data: T): string;
	label(data: T): string;
}

const strategies: Record<string, RequestStrategy<PendingRequest>> = {
	split: splitStrategy,
	ca: caStrategy,
	pb: pbStrategy,
	achievement: achievementStrategy,
};

export function getStrategy<T extends PendingRequest>(
	data: T,
): RequestStrategy<T> {
	return strategies[data.type];
}
