import type { Interaction } from 'discord.js';
import User from './User.js';

export const Guild = new Map<string, User>();
const ENABLE_LOGGING = true;

export const validateUserExists = (interaction: Interaction) => {
	let guildId = interaction.guildId;
	let userId = interaction.user.id;
	let userName = interaction.user.username;

	if (!guildId) return;
	if (!userId) return;
	if (!userName) return;

	// Check if user exists
	if (!Guild.get(userId)) {
		Guild.set(userId, new User(userName, guildId, 0));

		console.log(Guild);

		if (ENABLE_LOGGING)
			console.log(`Created user ${userId} in guild ${guildId}`);
	}
};

export const populateGuild = () => {
	// Populate guild on startup with users from database
	// This should only be executed once on startup
};
