import updateEmbed from "@commands/pb/func/updateEmbed";
import { Requests } from "@requests/main";
import type { TeamParam } from "@typings/api/team";
import { invalidateGuildCache } from "@utils/guildTimes";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import {
	MessageFlags,
	type CommandInteraction,
	type GuildMember,
} from "discord.js";

export async function removeUserFromTimeHelper(
	user: GuildMember,
	boss: string,
	interaction: CommandInteraction<"cached">,
) {
	const params: TeamParam = { type: "boss", boss };
	const res = await Requests.removeFromTeam(
		interaction.guild.id,
		user.id,
		params,
	);
	if (res.error && res.status === 404) {
		return await replyHandler(res.message, interaction, {
			flags: MessageFlags.Ephemeral,
		});
	}

	if (res.error) {
		return await replyHandler(getString("api", "internalError"), interaction, {
			flags: MessageFlags.Ephemeral,
		});
	}

	invalidateGuildCache(interaction.guild.id);

	await replyHandler(
		getString("teams", "removedFromBoss", {
			user: user.displayName,
			boss,
		}),
		interaction,
		{ flags: MessageFlags.Ephemeral },
	);

	const success = await updateEmbed(boss, interaction);
	if (!success) {
		await replyHandler(getString("times", "failedUpdatingEmbed"), interaction, {
			flags: MessageFlags.Ephemeral,
		});
	}
}
