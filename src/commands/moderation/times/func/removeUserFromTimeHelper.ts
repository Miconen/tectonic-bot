import { Requests } from "@requests/main";
import type { TeamParam } from "@typings/requests";
import { invalidateGuildCache } from "@utils/guildTimes";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import type { CommandInteraction, GuildMember } from "discord.js";

export async function removeUserFromTimeHelper(
	user: GuildMember,
	boss: string,
	interaction: CommandInteraction,
) {
	if (!interaction.guild) {
		return await replyHandler(getString("errors", "noGuild"), interaction, {
			ephemeral: true,
		});
	}

	const params: TeamParam = { type: "boss", boss };
	const res = await Requests.addToTeam(interaction.guild.id, user.id, params);
	if (res.error && res.status === 404) {
		return await replyHandler(res.message, interaction, {
			ephemeral: true,
		});
	}

	if (res.error) {
		return await replyHandler(getString("api", "internalError"), interaction, {
			ephemeral: true,
		});
	}

	invalidateGuildCache(interaction.guild.id);

	await replyHandler(
		getString("teams", "removedFromBoss", {
			user: user.displayName,
			boss,
		}),
		interaction,
		{ ephemeral: true },
	);
}
