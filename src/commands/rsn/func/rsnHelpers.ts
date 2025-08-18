import { Requests } from "@requests/main.js";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo";
import type { CommandInteraction, GuildMember } from "discord.js";

export async function addRsnHelper(
	user: GuildMember,
	rsn: string,
	interaction: CommandInteraction,
) {
	if (!interaction.guild) {
		await replyHandler(getString("errors", "noGuild"), interaction, {
			ephemeral: true,
		});
		return;
	}

	await interaction.deferReply();

	const res = await Requests.addRsn(interaction.guild.id, user.id, rsn);
	let error = getString("errors", "rsnFail", { rsn });

	if (res.status === 404) {
		error += `\n${getString("errors", "notActivated", { username: user.displayName })}`;
		return await replyHandler(error, interaction);
	}

	if (res.status === 409) {
		error += `\n${getString("errors", "rsnExists", { username: user.displayName })} `;
		return await replyHandler(error, interaction);
	}

	if (res.error) {
		error += `\n${getString("errors", "internalError")}`;
		return await replyHandler(error, interaction);
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
	interaction: CommandInteraction,
) {
	if (!interaction.guild) {
		await replyHandler(getString("errors", "noGuild"), interaction, {
			ephemeral: true,
		});
		return;
	}

	await interaction.deferReply();

	const removed = await Requests.removeRsn(interaction.guild.id, user.id, rsn);

	if (removed.status === 404) {
		return await replyHandler(
			getString("errors", "rsnDoesntExist", {
				rsn,
				username: user.displayName,
			}),
			interaction,
		);
	}

	if (removed.error) {
		return await replyHandler(
			getString("errors", "internalError"),
			interaction,
		);
	}

	return await replyHandler(
		getString("accounts", "rsnRemoved", { rsn, username: user.displayName }),
		interaction,
	);
}
