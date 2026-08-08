import { getContext } from "@logging/context";
import type { ErrorResponse } from "@typings/api/errors";
import { apiErrorNames } from "@utils/errors/api/lookup";
import { getString } from "@utils/stringRepo";

type ErrorContext = {
	category?: string;
	args?: Record<string, unknown>;
};

// Automates categorical error message overloading by leaning on the string repo
export function getApiErrorMessage(
	error: ErrorResponse,
	context: ErrorContext = {},
): string {
	const store = getContext();
	return `${constructMessage(error, context)}\n-# Error ID: ${store?.correlationId}`;
}

function constructMessage(error: ErrorResponse, context: ErrorContext): string {
	const key = apiErrorNames[error.code];
	if (!key) return error.message;

	const contextual = context.category
		? getString(context.category, key, context.args, { fallthrough: true })
		: undefined;

	if (contextual) return contextual;

	const standard = getString("apiErrors", key, undefined, {
		fallthrough: true,
	});

	return standard ?? error.message;
}
