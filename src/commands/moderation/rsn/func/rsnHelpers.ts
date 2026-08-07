import { Requests } from "@requests/main.js";
import { replyApiError } from "@utils/replyApiError";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo";
import type { CommandInteraction, GuildMember } from "discord.js";

export async function addRsnHelper(
	user: GuildMember,
	rsn: string,
	interaction: CommandInteraction<"cached">,
) {
	const res = await Requests.addRsn(interaction.guild.id, user.id, rsn);
	if (res.error) {
		return await replyApiError(res, interaction, {
			category: "accountErrors",
			args: {
				rsn,
				username: user.displayName,
			},
		});
	}

	const rsns = await Requests.getUser(interaction.guild.id, {
		type: "user_id",
		user_id: user.id,
	});

	const response: string[] = [];
	response.push(
		getString("accounts", "rsnListHeader", { username: user.displayName }),
		getString("accounts", "rsnAdded", {
			rsn,
			username: user.displayName,
		}),
	);

	if (rsns.error) {
		// Failed to fetch user RSNs after succesfully adding new one
		return await replyHandler(response.join("\n"), interaction);
	}

	if (!rsns.data) {
		return getString("errors", "internalError");
	}

	response.push(rsns.data.rsns.map((rsn) => `\`${rsn.rsn}\``).join("\n"));
	return await replyHandler(response.join("\n"), interaction);
}

export async function removeRsnHelper(
	user: GuildMember,
	rsn: string,
	interaction: CommandInteraction<"cached">,
) {
	await interaction.deferReply();

	const res = await Requests.removeRsn(interaction.guild.id, user.id, rsn);
	if (res.error) {
		return await replyApiError(res, interaction, {
			category: "accountErrors",
			args: {
				rsn,
				username: user.displayName,
			},
		});
	}

	return await replyHandler(
		getString("accounts", "rsnRemoved", { rsn, username: user.displayName }),
		interaction,
	);
}
