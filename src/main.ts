import "reflect-metadata";

import { dirname, importx } from "@discordx/importer";
import type { Interaction } from "discord.js";
import { IntentsBitField, Options, Partials } from "discord.js";
import { Client } from "discordx";
import "dotenv/config";
import { IsHealthy } from "@guards/IsHealthy.js";
import { LoggingGuard } from "@logging/guard.js";
import { rootLogger } from "@logging/logger.js";
import { startStatusRotation } from "@utils/status.js";

// biome-ignore lint/suspicious/noExplicitAny: TEMPORARY FIX TO THIS: https://github.com/oceanroleplay/discord.ts/issues/840
(BigInt.prototype as any).toJSON = function () {
	return this.toString();
};

export const bot = new Client({
	// To only use global commands (use @Guild for specific guild command), comment this line
	botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],

	// Discord intents
	intents: [
		IntentsBitField.Flags.Guilds,
		// Needed for guildMemberRemove and full member fetches
		IntentsBitField.Flags.GuildMembers,
	],

	// Emit guildMemberRemove even for members that are not cached
	partials: [Partials.GuildMember],

	// Keep memory low: the bot only works through slash commands and REST,
	// so it never needs cached messages, presences or reactions.
	makeCache: Options.cacheWithLimits({
		...Options.DefaultMakeCacheSettings,
		MessageManager: 0,
		PresenceManager: 0,
		ReactionManager: 0,
	}),

	// Full member fetches (e.g. /moderation points role) fill the member
	// cache; drop those members again every hour, keeping the bot itself.
	sweepers: {
		...Options.DefaultSweeperSettings,
		guildMembers: {
			interval: 60 * 60,
			filter: () => (member) => member.id !== member.client.user.id,
		},
	},

	// Perform these before each command
	guards: [LoggingGuard, IsHealthy],

	// Debug logs are disabled in silent mode
	silent: true,
});

bot.once("ready", async () => {
	// Make sure all guilds are cached
	await bot.guilds.fetch();

	// Synchronize applications commands with Discord
	await bot.initApplicationCommands();

	// To clear all guild commands, uncomment this line,
	// This is useful when moving from guild commands to global commands
	// It must only be executed once

	// await bot.clearApplicationCommands(...bot.guilds.cache.map((g) => g.id));

	rootLogger.info("Bot started");
	startStatusRotation(bot);
});

bot.on("interactionCreate", (interaction: Interaction) => {
	bot.executeInteraction(interaction);
});

async function run() {
	// Import commands
	await importx(
		`${dirname(import.meta.url)}/{events,commands}/**/**/*.{ts,js}`,
	);
	// Let's start the bot
	if (!process.env.BOT_TOKEN) {
		throw Error("Could not find BOT_TOKEN in your environment");
	}

	// Log in with your bot token
	await bot.login(process.env.BOT_TOKEN);
}

run();
