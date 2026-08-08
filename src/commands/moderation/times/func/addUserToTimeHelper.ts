import updateEmbed from "@commands/pb/func/updateEmbed";
import { Requests } from "@requests/main";
import type { TeamParam } from "@typings/api/team";
import { invalidateGuildCache } from "@utils/guildTimes";
import { replyApiError } from "@utils/replyApiError";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import {
	MessageFlags,
	type CommandInteraction,
	type GuildMember,
} from "discord.js";

export async function addUserToTimeHelper(
	user: GuildMember,
	boss: string,
	interaction: CommandInteraction<"cached">,
) {
	const params: TeamParam = { type: "boss", boss };
	const res = await Requests.addToTeam(interaction.guild.id, user.id, params);
	if (res.error) {
		return await replyApiError(res, interaction, { category: "recordErrors" });
	}

	invalidateGuildCache(interaction.guild.id);

	await replyHandler(
		getString("teams", "addedToBoss", {
			user: user.displayName,
			boss,
		}),
		interaction,
		{ flags: MessageFlags.Ephemeral },
	);

	await updateEmbed(boss, interaction);
}
