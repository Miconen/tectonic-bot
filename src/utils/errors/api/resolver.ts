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
	const key = apiErrorNames[error.code];
	if (!key) return error.message;

	if (context.category) {
		const contextual = getString(context.category, key, context.args);

		// Avoid returning stringRepo's missing-key placeholder
		if (!contextual.startsWith("[")) {
			return contextual;
		}
	}

	const standard = getString("apiErrors", key);

	// Avoid returning stringRepo's missing-key placeholder
	if (!standard.startsWith("[")) {
		return standard;
	}

	return error.message;
}
