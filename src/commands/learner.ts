import { CommandInteraction, GuildMember } from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import updateUserPoints from "../data/database/updateUserPoints.js";
import pointsHandler, { PointRewardsMap } from "../data/pointHandling.js";
import { rankUpHandler } from "../data/roleHandling.js";
import IsAdmin from "../utility/isAdmin.js";

@Discord()
@SlashGroup({name: 'learner', description: 'Learner pvm specific commands'})
@SlashGroup('learner')
class Learner {
    @Slash('half')
    async half(
		@SlashOption('username')
		channel: GuildMember,
        interaction: CommandInteraction
    ) {
		if (!IsAdmin(Number(interaction.member?.permissions))) return;
        let points = await pointsHandler(PointRewardsMap.get('learner_half'), interaction.guild!.id)
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
    @Slash('full')
    async full(
		@SlashOption('username')
		channel: GuildMember,
        interaction: CommandInteraction
    ) {
		if (!IsAdmin(Number(interaction.member?.permissions))) return;
        let points = await pointsHandler(PointRewardsMap.get('learner_full'), interaction.guild!.id)
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