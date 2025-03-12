import { Requests } from "@requests/main.js";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo";
import type { CommandInteraction, GuildMember } from "discord.js";

export async function addRsnHelper(
	user: GuildMember,
	rsn: string,
	interaction: CommandInteraction,
) {
	if (!interaction.guild) return;
	await interaction.deferReply();

	let response = `## ${user.displayName} RSNs\n`;

	const res = await Requests.addRsn(interaction.guild.id, user.id, rsn);

	if (res.status === 404) {
		const error = `Failed to add RSN (**${rsn}**)\nIs the user (**${user.displayName}**) activated?`;
		return await replyHandler(error, interaction);
	}

	if (res.status === 409) {
		const error = `Failed to add RSN (**${rsn}**)\nRSN already exists on user **${user.displayName}**`;
		return await replyHandler(error, interaction);
	}

	if (res.error) {
		const error = `Failed to add RSN (**${rsn}**)\nInternal server error (${res.message})`;
		return await replyHandler(error, interaction);
	}

	const rsns = await Requests.getUser(interaction.guild.id, {
		type: "user_id",
		user_id: user.id,
	});
	if (rsns.error) {
		const error = "Failed to fetch user RSNs after succesfully adding new one";
		return await replyHandler(error, interaction);
	}

	if (!rsns.data) {
		return getString("accounts", "notActivated", {
			username: user.displayName,
		});
	}

	response += `Succesfully added new RSN (**${rsn}**)\n`;
	response += rsns.data.rsns.map((rsn) => `\`${rsn.rsn}\``).join("\n");

	return await replyHandler(response, interaction);
}

export async function removeRsnHelper(
	user: GuildMember,
	rsn: string,
	interaction: CommandInteraction,
) {
	if (!interaction.guild?.id) return;

	await interaction.deferReply();

	let response = "";
	try {
		const removed = await Requests.removeRsn(
			interaction.guild.id,
			user.id,
			rsn,
		);
		if (removed) {
			response = `Removed RSN (**${rsn}**) from **${user.displayName}**`;
		} else {
			response = `Couldn't find RSN (**${rsn}**) linked to **${user.displayName}**`;
		}
	} catch (e) {
		const error = `Failed to remove (**${rsn}**), is the user (**${user.displayName}**) activated?`;
		return await replyHandler(error, interaction);
	}

	return await replyHandler(response, interaction);
}
