import { Requests } from "@requests/main.js";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import { type CommandInteraction, GuildMember } from "discord.js";
import type { GuardFunction } from "discordx";

function IsActivated(target = "player") {
	const guard: GuardFunction<CommandInteraction> = async (
		interaction,
		_,
		next,
	) => {
		console.log("Checking if all players are activated (IsActivated guard)");

		const players: GuildMember[] = [];

		// Dirty hack to extract GuildMembers from the guarded commands options
		const options = interaction.options.data.at(0)?.options;
		if (!options)
			return await replyHandler(
				getString("errors", "parameterMissing", { parameter: "players" }),
				interaction,
				{ ephemeral: true },
			);

		for (const option of options) {
			if (
				option.name.includes(target) &&
				option.member &&
				option.member instanceof GuildMember
			) {
				console.log("option was guild member");
				players.push(option.member);
			} else if (option.name.includes(target)) {
				console.error(
					"### Something went wrong with IsActivated guard finding GuildMembers ###",
				);
			}
		}

		if (!players.length) {
			console.log("↳ Error retrieving players");
			const warning = "Failed to fetch players from command";
			return await replyHandler(warning, interaction);
		}
		console.log("↳ Players list populated");

		if (!interaction.guild?.id) {
			console.log("↳ Error getting guild ID");
			return await replyHandler(getString("errors", "noGuild"), interaction);
		}

		const playersUserIds = players.map((member) => member.id);
		const playersUserNames = players.map((member) => `${member.displayName}`);
		console.log(
			`Checking activation statuses for: ${playersUserNames.join(", ")}`,
		);

		const res = await Requests.getUsers(interaction.guild.id, {
			type: "user_id",
			user_id: playersUserIds,
		});
		if (res.error)
			return await replyHandler(
				getString("errors", "fetchFailed", { resource: "users" }),
				interaction,
				{ ephemeral: true },
			);
		if (!res.data.length)
			return await replyHandler(
				getString("errors", "fetchFailed", { resource: "users" }),
				interaction,
				{ ephemeral: true },
			);

		const existingUsers = res.data;

		let warning = "";

		for (const member of players) {
			const userExists = existingUsers.some(
				(user) => user.user_id === member.id,
			);
			if (!userExists) {
				console.log(`↳ Denied, not activated: ${member.displayName}`);
				warning += `❌ **${member.displayName}** is not activated.\n`;
			}
		}

		if (warning) {
			console.log(warning);
			return await replyHandler(
				getString("errors", "commandFailed", { reason: warning }),
				interaction,
				{ ephemeral: true },
			);
		}

		console.log("↳ Passed");
		await next();
	};

	return guard;
}

export default IsActivated;
