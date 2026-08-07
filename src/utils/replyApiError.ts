import { getContext } from "@logging/context";
import type { ErrorResponse } from "@typings/api/errors";
import { getApiErrorMessage } from "@utils/errors/api/resolver";
import { replyHandler } from "@utils/replyHandler";
import {
	MessageFlags,
	type ButtonInteraction,
	type CommandInteraction,
} from "discord.js";

type ErrorContext = {
	category?: string;
	args?: Record<string, unknown>;
};

export function replyApiError(
	error: ErrorResponse,
	interaction: CommandInteraction | ButtonInteraction,
	context?: ErrorContext,
) {
	const store = getContext();
	const message = `${getApiErrorMessage(error, context)}\n-# Error ID: ${store?.correlationId}`;
	return replyHandler(message, interaction, { flags: MessageFlags.Ephemeral });
}
