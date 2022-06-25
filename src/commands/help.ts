import { Discord, Slash, SlashOption, SlashGroup } from 'discordx';
import { CommandInteraction, User } from 'discord.js'
import pointsHandler, { PointRewardsMap } from '../data/pointHandling.js';

@Discord()
@SlashGroup({ name: 'help', description: 'Commands to help you use commands' })
@SlashGroup('help')
class Help {
	@Slash('bump')
	bump(
		interaction: CommandInteraction
	) {
		let points = pointsHandler(PointRewardsMap.get('forum_bump'), interaction.guild!.id);
		
		points.then((res: any) => {
			interaction.reply(`You can gain points for bumping our forum post here: (insert link).\nPoint reward: ${res}`);
		});
    }
	@Slash('split')
	async split(
		interaction: CommandInteraction
	) {
		let points_low = await pointsHandler(PointRewardsMap.get('split_low'), interaction.guild!.id);	
		let points_medium = await pointsHandler(PointRewardsMap.get('split_medium'), interaction.guild!.id);	
		let points_high = await pointsHandler(PointRewardsMap.get('split_high'), interaction.guild!.id);	
		
		interaction.reply(`Gain points for recieving a drop and splitting with your clan mates, screenshot of loot and teammates names required as proof.\nRequires user to be an activated user\nPoint rewards: ${points_low}, ${points_medium} & ${points_high}`)
	}
	@Slash('activate')
	activate(
		interaction: CommandInteraction
	) {
		interaction.reply(`Admin only command, used to activate new member of the community. This command handles all automation for new users and allows them to gain points/ranks. This should be used on all new users that are a part of the clan.`)
	}
}

@Discord()
@SlashGroup({ name: 'rsn', description: 'Help for the rsn related commands', root: 'help'})
@SlashGroup('rsn', 'help')
class HelpRsn {
	@Slash('set')
	set(
		interaction: CommandInteraction
	) {
		interaction.reply('Temporarily admin only command, bind your osrs account(s) to your discord user.')
	}
	@Slash('lookup')
	lookup(
		interaction: CommandInteraction
	) {
		interaction.reply('Lookup discord users osrs account(s)')
	}
}