import { CommandInteraction, User } from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import updateUserPoints from "../data/database/updateUserPoints.js";
import pointsHandler, { PointRewardsMap } from "../data/pointHandling.js";
import IsAdmin from "../utility/isAdmin.js";

@Discord()
@SlashGroup({name: 'event', description: 'Event specific commands'})
@SlashGroup('event')
class Event {
    @Slash('participation')
    async participation(
		@SlashOption('username')
		channel: User,
        interaction: CommandInteraction
    ) {
		if (!IsAdmin(Number(interaction.member?.permissions))) return;
        let points = await pointsHandler(PointRewardsMap.get('event_participation'), interaction.guild!.id)
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
    @Slash('hosting')
    async hosting(
		@SlashOption('username')
		channel: User,
        interaction: CommandInteraction
    ) {
		if (!IsAdmin(Number(interaction.member?.permissions))) return;
        let points = await pointsHandler(PointRewardsMap.get('event_hosting'), interaction.guild!.id)
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