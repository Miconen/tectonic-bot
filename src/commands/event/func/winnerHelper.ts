import { Requests } from "@requests/main";
import { getString } from "@utils/stringRepo";
import type { CommandInteraction, GuildMember } from "discord.js";

export async function winnerHelper(
	interaction: CommandInteraction,
	competitionId: number,
	top = 3,
) {
	if (!interaction.guild) {
		await interaction.reply({
			content: getString("errors", "noGuild"),
			ephemeral: true,
		});
		return;
	}

	if (!interaction.member) {
		await interaction.reply({
			content: getString("errors", "noMember"),
			ephemeral: true,
		});
		return;
	}

	const member = interaction.member as GuildMember;

	const res = await Requests.eventWinners(interaction.guild.id, {
		type: "individual",
		competition: competitionId,
		top,
	});

	if (res.error) {
		return interaction.reply(res.message);
	}

	const winners = res.data;
	const response: string[] = [];

	response.push("# Event positions given");
	for (const winner of winners) {
		response.push(winner.player.displayName);
	}

	return interaction.reply(response.join("\n"));
}
