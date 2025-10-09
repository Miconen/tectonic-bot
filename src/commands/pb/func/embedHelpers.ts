import { EmbedBuilder, APIEmbedField, Collection, GuildMember, BaseInteraction, Guild } from "discord.js";
import TimeConverter from "./TimeConverter";
import { EmbedBossData, EmbedCategoryData } from "@utils/guilds";
import { getString } from "@utils/stringRepo";
import { Team } from "@typings/requests";

// Amount of padding to give to guarantee maximum width on Discord embeds
const PADDING = 110;

// Adds invisible non space padding to expand embeds to a consistent size
function padTo(to: number, s: string) {
	if (s.length === to) return s;
	return s + "‎ ".repeat(to - s.length);
}

export default function buildCategoryEmbed(category: EmbedCategoryData): EmbedBuilder {
	return new EmbedBuilder()
		.setColor("#E00000")
		.setTitle(category.name)
		.setThumbnail(category.thumbnail);
};

export function buildBossField(boss: EmbedBossData, members: Collection<string, GuildMember>) {
	let time = "\`No time yet\`";
	if (boss.pb_time_ticks) {
		time = `\`${TimeConverter.ticksToTime(boss.pb_time_ticks)}\``;
	}

	const team =
		boss.teammate_user_ids
			.map((player) => `**${members.get(player)?.displayName}**`)
			.join(", ") ?? "";

	return {
		name: boss.display_name,
		value: [time, team].filter(Boolean).join(" - "),
	};
}

export function buildBossFields(bosses: EmbedBossData[], members: Collection<string, GuildMember>) {
	const fields: APIEmbedField[] = [];

	for (const boss of bosses) {
		fields.push(buildBossField(boss, members))
	}

	return fields
}

export function findCategoryByBoss(categories: EmbedCategoryData[], boss: string) {
	return categories.find((c) => c.bosses.some((b) => b.name === boss));
}

export async function getMembersFromUserIds(guild: Guild, user_ids: string[]) {
	// Get rid of duplicate user_ids
	const players = [...new Set(user_ids)];
	const members = await guild.members.fetch({ user: players });

	return members
}


export async function getMembersFromTeams(guild: Guild, teams: Team[] | undefined) {
	if (!teams) {
		return new Collection<string, GuildMember>
	}

	const user_ids = teams.map(team => team.user_id)

	// Get rid of duplicate user_ids
	const players = [...new Set(user_ids)];
	const members = await guild.members.fetch({ user: players });

	return members
}
