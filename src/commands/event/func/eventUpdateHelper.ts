import { updateEvent } from "@requests/guild";
import { EventUpdateParam } from "@typings/requests";
import { getEvent, updateEventCache } from "@utils/events";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import type { CommandInteraction } from "discord.js";

export async function eventUpdateHelper(
	event: string,
	params: EventUpdateParam,
	interaction: CommandInteraction,
) {
	if (!interaction.guild) {
		await replyHandler(getString("errors", "noGuild"), interaction, {
			ephemeral: true,
		});
		return;
	}

	if (!params.position_cutoff && !params.name) {
		return replyHandler(getString("competitions", "eventUpdatedField", { field: "cutoff", value: params.position_cutoff }), interaction, { ephemeral: true })
	}

	const response = await updateEvent(interaction.guild.id, event, params)
	if (!response || response.error) {
		await replyHandler(getString("errors", "noEvents"), interaction, {
			ephemeral: true,
		});
		return;
	}

	await updateEventCache(interaction.guild.id, event, params)

	const ev = await getEvent(interaction.guild.id, event)
	if (!ev) {
		await replyHandler(getString("errors", "noEvents"), interaction, {
			ephemeral: true,
		});
		return
	}

	const reply: string[] = []
	reply.push(getString("competitions", "eventUpdatedHeader"))

	if (params.position_cutoff) {
		const r: string[] = []
		r.push(getString("competitions", "eventUpdatedField", { field: "cutoff" }))
		r.push(getString("competitions", "eventUpdatedFieldFrom", { value: ev.position_cutoff }))
		r.push(getString("competitions", "eventUpdatedFieldTo", { value: params.position_cutoff }))

		reply.push(r.join("\n"))
	}

	if (params.name) {
		const r: string[] = []
		r.push(getString("competitions", "eventUpdatedField", { field: "name" }))
		r.push(getString("competitions", "eventUpdatedFieldFrom", { value: ev.name }))
		r.push(getString("competitions", "eventUpdatedFieldTo", { value: params.name }))

		reply.push(r.join("\n"))
	}


	return replyHandler(reply.join("\n"), interaction, { ephemeral: true });
}
