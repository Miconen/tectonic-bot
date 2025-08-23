import { AsyncLocalStorage } from "node:async_hooks";
import type { Logger } from "pino";
import { rootLogger } from "./logger";

interface LoggingContext {
	logger: Logger;
	correlationId: string;
	// Room for expansion
	[key: string]: unknown;
}

const asyncLocalStorage = new AsyncLocalStorage<LoggingContext>();

export const withContext = <T>(
	contextData: LoggingContext,
	callback: () => Promise<T>,
): Promise<T> => {
	return asyncLocalStorage.run(contextData, callback);
};

export const getContext = (): LoggingContext | undefined => {
	return asyncLocalStorage.getStore();
};

export const getLogger = (): Logger => {
	const context = getContext();
	if (!context?.logger) {
		throw new Error(
			"No logging context found. Make sure you're calling this within a logged command.",
		);
	}
	return context.logger;
};

// Optional: Get a child logger with additional context
export const getChildLogger = (
	additionalContext: Record<string, unknown>,
): Logger => {
	const logger = getLogger();
	return logger.child(additionalContext);
};

// Utility for initialization/startup logging
export const withInitLogging = async <T>(
	operationName: string,
	operation: () => Promise<T>,
	additionalContext: Record<string, unknown> = {},
): Promise<T> => {
	const correlationId = `init-${Date.now()}`;
	const logger = rootLogger.child({
		correlationId,
		context: "initialization",
		operation: operationName,
		...additionalContext,
	});

	return withContext({ logger, correlationId }, async () => {
		logger.info(`Starting ${operationName}`);
		const startTime = Date.now();

		try {
			const result = await operation();
			const duration = Date.now() - startTime;
			logger.info({ duration }, `Completed ${operationName}`);
			return result;
		} catch (error) {
			const duration = Date.now() - startTime;
			logger.error({ error, duration }, `Failed ${operationName}`);
			throw error;
		}
	});
};
