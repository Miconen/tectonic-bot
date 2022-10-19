import {
	ApplicationCommandOptionType,
	CommandInteraction,
	GuildMember,
} from 'discord.js';
import { Discord, Slash, SlashGroup, SlashOption } from 'discordx';
import updateUserPoints from '../data/database/updateUserPoints.js';
import pointsHandler, { PointRewardsMap } from '../data/pointHandling.js';
import { rankUpHandler } from '../data/roleHandling.js';
import IsAdmin from '../utility/isAdmin.js';

@Discord()
@SlashGroup({ name: 'event', description: 'Event specific commands' })
@SlashGroup('event')
class Event {
	@Slash({
		name: 'participation',
		description: 'Command for giving out event specific points',
	})
	async participation(
		@SlashOption({
			name: 'username',
			description: 'Participation point rewards',
			required: true,
			type: ApplicationCommandOptionType.User,
		})
		channel: GuildMember,
		interaction: CommandInteraction
	) {
		if (!IsAdmin(Number(interaction.member?.permissions))) return;
		let points = await pointsHandler(
			PointRewardsMap.get('event_participation'),
			interaction.guild!.id
		);
		let result = updateUserPoints(
			interaction.guild!.id,
			// @ts-ignore
			channel.user.id,
			points!
		);
		let response = 'Error giving points';
		result
			.then((res) => {
				if (Number.isInteger(res)) {
					// @ts-ignore
					response = `✔️ ${channel.user} was granted ${points} points by ${interaction.member} and now has a total of ${res} points.`;
					rankUpHandler(interaction, channel, res - points, res);
				}
				if (res == false) {
					// @ts-ignore
					response = `❌ ${channel.user} Is not an activated user.`;
				}
			})
			.catch((err) => {
				console.log(err);
			})
			.finally(() => {
				interaction.reply(response);
			});
	}
	@Slash({ name: 'hosting', description: 'Event hosting specific command' })
	async hosting(
		@SlashOption({
			name: 'username',
			description: 'Event hosting point rewards',
			required: true,
			type: ApplicationCommandOptionType.User,
		})
		channel: GuildMember,
		interaction: CommandInteraction
	) {
		if (!IsAdmin(Number(interaction.member?.permissions))) return;
		let points = await pointsHandler(
			PointRewardsMap.get('event_hosting'),
			interaction.guild!.id
		);
		let result = updateUserPoints(
			interaction.guild!.id,
			// @ts-ignore
			channel.user.id,
			points!
		);
		let response = 'Error giving points';
		result
			.then((res) => {
				if (Number.isInteger(res)) {
					// @ts-ignore
					response = `✔️ ${channel.user} was granted ${points} points by ${interaction.member} and now has a total of ${res} points.`;
					rankUpHandler(interaction, channel, res - points, res);
				}
				if (res == false) {
					// @ts-ignore
					response = `❌ ${channel.user} Is not an activated user.`;
				}
			})
			.catch((err) => {
				console.log(err);
			})
			.finally(() => {
				interaction.reply(response);
			});
	}
}
