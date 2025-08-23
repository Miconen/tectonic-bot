import { Requests } from "@requests/main";
import { getEvents } from "@utils/events";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import type { CommandInteraction } from "discord.js";

export async function eventInfoHelper(
	event: string,
	interaction: CommandInteraction,
) {
	if (!interaction.guild) {
		await replyHandler(getString("errors", "noGuild"), interaction, {
			ephemeral: true,
		});
		return;
	}

	const guild_events = await getEvents(interaction.guild.id);
	if (!guild_events) {
		await replyHandler(getString("errors", "noEvents"), interaction, {
			ephemeral: true,
		});
		return;
	}

	const e = guild_events.find((ev) => ev.wom_id === event);
	if (!e) {
		await replyHandler(getString("events", "wrongId"), interaction, {
			ephemeral: true,
		});
		return;
	}

	const res = await Requests.getEventParticipants(
		interaction.guild.id,
		e.wom_id,
	);
	if (res.error || !res.data) {
		await replyHandler(getString("errors", "internalError"), interaction, {
			ephemeral: true,
		});
		return;
	}

	const response: string[] = [];
	response.push(`# ${e.name}`);

	const members = await interaction.guild.members.fetch({
		user: res.data.participations.map((p) => p.user_id),
	});
	for (const p of res.data.participations) {
		const member = members.get(p.user_id);
		if (!member) continue;

		response.push(`${p.placement}. ${member.displayName}`);
	}

	return replyHandler(response.join("\n"), interaction);
}
