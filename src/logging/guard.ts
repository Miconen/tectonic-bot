import {
	type AutocompleteInteraction,
	type ButtonInteraction,
	CommandInteraction,
	GuildMember,
	ChatInputCommandInteraction,
} from "discord.js";
import type { ArgsOf, GuardFunction } from "discordx";
import { withContext } from "./context";
import { rootLogger } from "./logger";

type Leave = ArgsOf<"guildMemberRemove">;
type InteractionType = CommandInteraction | ButtonInteraction | AutocompleteInteraction;

// Type guard to check if the parameter is an interaction
function isInteraction(param: InteractionType | Leave): param is InteractionType {
	return 'id' in param && 'user' in param;
}

// Type guard to check if the parameter is a guild leave event
function isGuildLeave(param: InteractionType | Leave): param is Leave {
	return Array.isArray(param) && param[0] instanceof GuildMember;
}

export const LoggingGuard: GuardFunction<InteractionType | Leave> = async (
	param,
	_, // Client
	next,
) => {
	const startTime = Date.now();
	let correlationId: string;
	let command: string;
	let baseContext: Record<string, unknown>;

	if (isInteraction(param)) {
		correlationId = param.id;
		command = "Button interaction";

		if (param instanceof ChatInputCommandInteraction) {
			const subcommandGroup = param.options.getSubcommandGroup(false);
			const subcommand = param.options.getSubcommand(false);

			command = [param.commandName, subcommandGroup, subcommand]
				.filter(Boolean)
				.join(" ");

		} else if (param instanceof CommandInteraction) {
			command = param.commandName;
		}

		// Extract command info from interaction
		baseContext = {
			correlationId,
			command,
			userId: param.user.id,
			username: param.user.username,
			guildId: param.guildId,
			channelId: param.channelId,
		};
	}
	else if (isGuildLeave(param)) {
		// Handle guild member leave events
		const [member] = param;
		correlationId = `leave-${member.id}-${Date.now()}`;
		command = "Guild member leave";

		baseContext = {
			correlationId,
			command,
			userId: member.id,
			username: member.user.username,
			displayName: member.displayName,
			guildId: member.guild.id,
			guildName: member.guild.name,
			joinedAt: member.joinedAt?.toISOString(),
		};
	} else {
		// Fallback for unknown types
		correlationId = `unknown-${Date.now()}`;
		command = "Unknown event";
		baseContext = {
			correlationId,
			command,
		};
	}

	const logger = rootLogger.child(baseContext);

	return withContext({ logger, correlationId }, async () => {
		if (isGuildLeave(param)) {
			logger.info("Member left guild");
		} else {
			logger.info("Command started");
		}

		try {
			const result = await next();

			const duration = Date.now() - startTime;
			if (isGuildLeave(param)) {
				logger.info({ duration }, "Guild leave processed");
			} else {
				logger.info({ duration }, "Command completed");
			}

			return result;
		} catch (error) {
			const duration = Date.now() - startTime;
			if (isGuildLeave(param)) {
				logger.error({ err: error, duration }, "Guild leave processing failed");
			} else {
				logger.error({ err: error, duration }, "Command failed");
			}
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
