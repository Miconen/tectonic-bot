import {
	type AutocompleteInteraction,
	type ButtonInteraction,
	CommandInteraction,
} from "discord.js";
import type { GuardFunction } from "discordx";
import { withContext } from "./context";
import { rootLogger } from "./logger";

export const LoggingGuard: GuardFunction<
	CommandInteraction | ButtonInteraction
> = async (
	interaction,
	_, // Client
	next,
) => {
		const correlationId = interaction.id;
		const startTime = Date.now();

		let command = "Button interaction";
		if (interaction instanceof CommandInteraction) {
			command = interaction.commandName;
		}

		// Extract command info from interaction
		const baseContext = {
			correlationId,
			command,
			userId: interaction.user.id,
			username: interaction.user.username,
			guildId: interaction.guildId,
			channelId: interaction.channelId,
		};

		const logger = rootLogger.child(baseContext);

		return withContext({ logger, correlationId }, async () => {
			logger.info("Command started");

			try {
				const result = await next();

				const duration = Date.now() - startTime;
				logger.info({ duration }, "Command completed");

				return result;
			} catch (error) {
				const duration = Date.now() - startTime;
				logger.error({ err: error, duration }, "Command failed");
				throw error;
			}
		});
	};

// Autocomplete logging guard
export const AutocompleteLoggingGuard: GuardFunction<
	AutocompleteInteraction
> = async (
	interaction,
	_, //Client
	next,
) => {
		const correlationId = interaction.id;
		const startTime = Date.now();

		const commandName = interaction.commandName;
		const focusedOption = interaction.options.getFocused(true);

		const baseContext = {
			correlationId,
			command: `${commandName}:autocomplete`,
			focusedOption: focusedOption.name,
			focusedValue: focusedOption.value,
			userId: interaction.user.id,
			username: interaction.user.username,
			guildId: interaction.guildId,
			channelId: interaction.channelId,
		};

		const logger = rootLogger.child(baseContext);

		return withContext({ logger, correlationId }, async () => {
			logger.debug("Autocomplete started");

			try {
				const result = await next();

				const duration = Date.now() - startTime;
				logger.debug({ duration }, "Autocomplete completed");

				return result;
			} catch (error) {
				const duration = Date.now() - startTime;
				logger.error({ err: error, duration }, "Autocomplete failed");
				throw error;
			}
		});
	};

// Utility for wrapping autocomplete functions with logging
export const withAutocompleteLogging = <T extends unknown[]>(
	functionName: string,
	autocompleteFunction: (
		interaction: AutocompleteInteraction,
		...args: T
	) => Promise<void>,
	additionalContext: Record<string, unknown> = {},
) => {
	return async (
		interaction: AutocompleteInteraction,
		...args: T
	): Promise<void> => {
		const correlationId = interaction.id;
		const startTime = Date.now();

		const commandName = interaction.commandName;
		const focusedOption = interaction.options.getFocused(true);

		const baseContext = {
			correlationId,
			command: `${commandName}:autocomplete`,
			function: functionName,
			focusedOption: focusedOption.name,
			focusedValue: focusedOption.value,
			userId: interaction.user.id,
			username: interaction.user.username,
			guildId: interaction.guildId,
			channelId: interaction.channelId,
			...additionalContext,
		};

		const logger = rootLogger.child(baseContext);

		return withContext({ logger, correlationId }, async () => {
			logger.debug("Autocomplete started");

			try {
				const result = await autocompleteFunction(interaction, ...args);

				const duration = Date.now() - startTime;
				logger.debug({ duration }, "Autocomplete completed");

				return result;
			} catch (error) {
				const duration = Date.now() - startTime;
				logger.error({ err: error, duration }, "Autocomplete failed");
				throw error;
			}
		});
	};
};
