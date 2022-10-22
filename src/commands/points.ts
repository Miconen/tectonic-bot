import { Discord, Slash, SlashOption } from 'discordx';
import {
	ApplicationCommandOptionType,
	CommandInteraction,
	GuildMember,
} from 'discord.js';
import {getPoints} from '../data/database/getUser.js';
import {getRankByPoints, pointsToNextRank} from "../data/roleHandling.js";
import {roleIcon} from "../data/iconData.js";

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
		let targetUserName = user?.user?.username ?? interaction.user.username ?? "???";
		let points = await getPoints(interaction.guildId!, targetUser);

		let response: string;
		if (points || points === 0) {
			let helper: string;
			if (targetUser == user?.user?.id) {
				helper = `${user.user.username} has`;
			}
			else {
				helper = "You have";
			}

			let nextRankUntil = pointsToNextRank(points);
			let nextRankIcon = roleIcon.get(getRankByPoints(points + nextRankUntil));

			response = `${roleIcon.get(getRankByPoints(points))} ${helper}: ${points} points.`;
			if (getRankByPoints(points) != "Zenyte") response += `(${nextRankIcon} Points to next level: ${nextRankUntil})`;
		}
		else {
			response = `❌ ${targetUserName} is not activated.`;
		}

		await interaction.reply(response);
	}
}
