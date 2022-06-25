import { Discord, Slash, SlashOption, SlashGroup } from 'discordx';
import { CommandInteraction, User } from 'discord.js'
import pointsHandler, { PointRewardsMap } from '../data/pointHandling.js';

@Discord()
@SlashGroup({ name: 'help', description: 'Commands to help you use commands' })
@SlashGroup('help')
class Help {
	@Slash('bump')
	lookup(
		interaction: CommandInteraction
	) {
		let points = pointsHandler(PointRewardsMap.get('forum_bump'), interaction.guild!.id)
		
		points.then((res: any) => {
			interaction.reply(`You can gain points for bumping our forum post here: (insert link).\nPoints reward: ${res}`);
		});
    }
}