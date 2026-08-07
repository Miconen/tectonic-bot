import { getContext } from "@logging/context";
import type { ErrorResponse } from "@typings/api/errors";
import { getApiErrorMessage } from "@utils/errors/api/resolver";
import { replyHandler } from "@utils/replyHandler";
import {
	MessageFlags,
	type ButtonInteraction,
	type CommandInteraction,
	type InteractionReplyOptions,
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
	options: ReplyOptions = { flags: MessageFlags.Ephemeral },
) {
	const store = getContext();
	const message = `${getApiErrorMessage(error, context)}\n\n-# Give this to Comfy: ${store?.correlationId}`;
	return replyHandler(message, interaction, options);
}
