import {
	type AutocompleteInteraction,
	type ButtonInteraction,
	ChatInputCommandInteraction,
	CommandInteraction,
	type CommandInteractionOption,
	GuildMember,
} from "discord.js";
import type { ArgsOf, GuardFunction } from "discordx";
import { withContext } from "./context";
import { rootLogger } from "./logger";

type Leave = ArgsOf<"guildMemberRemove">;
type InteractionType =
	| CommandInteraction<"cached">
	| ButtonInteraction<"cached">
	| ChatInputCommandInteraction<"cached">
	| AutocompleteInteraction;

// Type guard to check if the parameter is an interaction
function isInteraction(
	param: InteractionType | Leave,
): param is InteractionType {
	return "id" in param && "user" in param;
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
	let userId: string | undefined;
	let options: Record<string, unknown> | undefined;

	if (isInteraction(param)) {
		correlationId = param.id;
		command = "Button interaction";

		if (param instanceof ChatInputCommandInteraction) {
			const subcommandGroup = param.options.getSubcommandGroup(false);
			const subcommand = param.options.getSubcommand(false);

			command = [param.commandName, subcommandGroup, subcommand]
				.filter(Boolean)
				.join(" ");
			options = commandOptions(param);
		} else if (param instanceof CommandInteraction) {
			command = param.commandName;
		}

		userId = param.user.id;
		// Extract command info from interaction
		baseContext = {
			correlationId,
			command,
			userId: param.user.id,
			username: param.user.username,
			guildId: param.guildId,
			channelId: param.channelId,
		};
	} else if (isGuildLeave(param)) {
		// Handle guild member leave events
		const [member] = param;
		userId = member.id;
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

	return withContext({ logger, correlationId, userId }, async () => {
		if (isGuildLeave(param)) {
			logger.info("Member left guild");
		} else {
			logger.info({ options }, "Command started");
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

	return withContext(
		{ logger, correlationId, userId: interaction.user.id },
		async () => {
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
		},
	);
};

// Utility for wrapping autocomplete functions with logging
export const withAutocompleteLogging = <T extends unknown[]>(
	functionName: string,
	autocompleteFunction: (
		interaction: AutocompleteInteraction<"cached">,
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

		if (!interaction.inCachedGuild()) {
			return await interaction.respond([]);
		}

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

		return withContext(
			{ logger, correlationId, userId: interaction.user.id },
			async () => {
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
			},
		);
	};
};

// commandOptions flattens a slash command's options for the start log line
// (#171), with users and roles shown as "id (name)".
function commandOptions(
	interaction: ChatInputCommandInteraction,
): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	const walk = (opts: readonly CommandInteractionOption[]) => {
		for (const o of opts) {
			if (o.options) walk(o.options);
			else if (o.user) out[o.name] = `${o.user.id} (${o.user.username})`;
			else if (o.role) out[o.name] = `${o.role.id} (${o.role.name})`;
			else if (o.attachment) out[o.name] = o.attachment.url;
			else out[o.name] = o.value;
		}
	};
	walk(interaction.options.data);
	return out;
}
