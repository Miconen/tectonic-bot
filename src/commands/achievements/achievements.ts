import IsAdmin from "@guards/IsAdmin.js";
import { Requests } from "@requests/main";
import type { DetailedUser } from "@typings/requests";
import { Achievements } from "@utils/achievements";
import {
	ApplicationCommandOptionType,
	type AutocompleteInteraction,
	type CommandInteraction,
	type GuildMember,
} from "discord.js";
import { Discord, Guard, Slash, SlashOption } from "discordx";

const cache = new Map<string, DetailedUser>(); // simple in-memory cache

async function fetchUser(guildId: string, userId: string) {
	if (cache.has(userId)) {
		console.log(`Hit autocomplete cache for user ${userId}`);
		return cache.get(userId);
	}

	const user = await Requests.getUser(guildId, {
		type: "user_id",
		user_id: userId,
	});

	if (user.error) return;
	if (!user.data) return;
	cache.set(userId, user.data);

	setTimeout(() => cache.delete(userId), 30 * 1000);
	return user.data;
}

async function achievementPicker(interaction: AutocompleteInteraction) {
	if (!interaction.guild?.id) return;

	const options = Achievements.map((a) => ({
		name: a.name,
		value: a.name,
	}));

	// Respond with the options (limit to 25 as per Discord's requirements)
	interaction.respond(options.slice(0, 25));
}

async function autocompleter(interaction: AutocompleteInteraction) {
	if (!interaction.guild?.id) return;
	const id = interaction.options.get("username")?.value ?? interaction.user.id;
	if (!id || typeof id !== "string") return;

	const user = await fetchUser(interaction.guild.id, id);

	if (!user) return;

	let rsns = user.rsns;

	const query = interaction.options.getFocused(true).value.toLowerCase();
	if (query) {
		rsns = user.rsns.filter((rsn) => rsn.rsn.toLowerCase().includes(query));
	}

	if (!rsns) return interaction.respond([]);

	// Convert Map entries to an array of autocomplete options
	const options = rsns.map((rsn) => ({
		name: rsn.rsn,
		value: rsn.rsn,
	}));

	// Respond with the options (limit to 25 as per Discord's requirements)
	interaction.respond(options.slice(0, 25));
}

@Discord()
class achievement {
	@Slash({
		name: "request",
		description: "Submit an achievement request",
	})
	@Guard(IsAdmin)
	async request(
		@SlashOption({
			name: "rsn",
			description: "RSN of the account",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: autocompleter,
		})
		rsn: string,
		@SlashOption({
			name: "achievement",
			description: "Achievement to request",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: autocompleter,
		})
		achievement: string,
		interaction: CommandInteraction,
	) {
		return await interaction.reply(rsn);
	}

	@Slash({
		name: "grant",
		description: "Grant an achievement",
	})
	@Guard(IsAdmin)
	async grant(
		@SlashOption({
			name: "username",
			description: "@User tag to target",
			required: true,
			type: ApplicationCommandOptionType.User,
		})
		user: GuildMember,
		@SlashOption({
			name: "rsn",
			description: "RSN of the user",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: autocompleter,
		})
		rsn: string,
		@SlashOption({
			name: "achievement",
			description: "Achievement to request",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: autocompleter,
		})
		achievement: string,
		interaction: CommandInteraction,
	) {
		return await interaction.reply(`${user.displayName} ${rsn} ${achievement}`);
	}

	@Slash({
		name: "remove",
		description: "Remove an achievement from a user",
	})
	@Guard(IsAdmin)
	async remove(
		@SlashOption({
			name: "username",
			description: "@User tag to target",
			required: true,
			type: ApplicationCommandOptionType.User,
		})
		user: GuildMember,
		@SlashOption({
			name: "rsn",
			description: "RSN of the user",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: autocompleter,
		})
		rsn: string,
		@SlashOption({
			name: "achievement",
			description: "Achievement to request",
			required: true,
			type: ApplicationCommandOptionType.String,
			autocomplete: autocompleter,
		})
		achievement: string,
		interaction: CommandInteraction,
	) {
		return await interaction.reply(rsn);
	}
}
