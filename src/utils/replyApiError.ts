import type { ErrorResponse } from "@typings/api/errors";
import { getApiErrorMessage } from "@utils/errors/api/resolver";
import { replyHandler } from "@utils/replyHandler";
import type {
	ButtonInteraction,
	CommandInteraction,
	InteractionReplyOptions,
} from "discord.js";

type ErrorContext = {
	category?: string;
	args?: Record<string, unknown>;
};

type ReplyOptions = Pick<InteractionReplyOptions, "flags">;

export function replyApiError(
	error: ErrorResponse,
	interaction: CommandInteraction | ButtonInteraction,
	context?: ErrorContext,
	options?: ReplyOptions,
) {
	return replyHandler(getApiErrorMessage(error, context), interaction, options);
}
