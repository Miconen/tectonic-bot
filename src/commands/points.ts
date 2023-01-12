import { Discord, Slash, SlashOption } from 'discordx';
import {
	ApplicationCommandOptionType,
	CommandInteraction,
	GuildMember,
} from 'discord.js';
import { getPoints } from '../database/getUser.js';
import { getRankByPoints } from "../data/rankUtils/getRankByPoints";
import { pointsToNextRank } from "../data/rankUtils/pointsToNextRank";
import { rankIcon } from "../data/rankUtils/iconData.js";

@Discord()
class Points {
	@Slash({
		name: 'points',
		description: 'Check your or someone elses points',
	})
	async points(
		@SlashOption({
			name: 'username',
			description:
				'Leave blank to check personal points or supply a name to check another user.',
			required: false,
			type: ApplicationCommandOptionType.User,
		})
		user: GuildMember | null,
		interaction: CommandInteraction
	) {
		let targetUser = user?.user?.id ?? interaction.user.id ?? "0";
		let targetUserName = user?.displayName ?? (interaction.member as GuildMember).displayName ?? "???";
		let points = await getPoints(interaction.guildId!, targetUser);

		let response: string;
		if (points || points === 0) {
			let nextRankUntil = pointsToNextRank(points);
			let nextRankIcon = rankIcon.get(getRankByPoints(points + nextRankUntil));

			response = `${rankIcon.get(getRankByPoints(points))} **${targetUserName}** has: ${points} points`;
			if (getRankByPoints(points) != "zenyte") response += `\n${nextRankIcon} Points to next level: ${nextRankUntil}`;
		}
		else {
			response = `❌ ${targetUserName} is not activated.`;
		}

		await interaction.reply(response);
	}
}
