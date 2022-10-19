import { Discord, Slash, SlashGroup } from 'discordx';
import { CommandInteraction } from 'discord.js';
import pointsHandler, { PointRewardsMap } from '../data/pointHandling.js';

@Discord()
@SlashGroup({ name: 'help', description: 'Commands to help you use commands' })
@SlashGroup('help')
class Help {
	@Slash({
		name: 'commands',
		description: 'Information about all commands',
	})
	commands(interaction: CommandInteraction) {
		interaction.reply(
			`Information on how to use the bot along with it's commands is provided here: https://github.com/Miconen/tectonic-bot/blob/main/README.md#commands`
		);
	}
	@Slash({
		name: 'bump',
		description: 'Information about bumping the forum post',
	})
	bump(interaction: CommandInteraction) {
		let points = pointsHandler(
			PointRewardsMap.get('forum_bump'),
			interaction.guild!.id
		);

		points.then((res: any) => {
			interaction.reply(
				`You can gain points for bumping our forum post here: https://secure.runescape.com/m=forum/a=13/c=tuplIA8cxpE/forums?320,321,794,66254540,goto,1\nPoint reward: ${res}`
			);
		});
	}
	@Slash({ name: 'split', description: 'Information about splitting' })
	async split(interaction: CommandInteraction) {
		let points_low = await pointsHandler(
			PointRewardsMap.get('split_low'),
			interaction.guild!.id
		);
		let points_medium = await pointsHandler(
			PointRewardsMap.get('split_medium'),
			interaction.guild!.id
		);
		let points_high = await pointsHandler(
			PointRewardsMap.get('split_high'),
			interaction.guild!.id
		);

		interaction.reply(
			`Gain points for recieving a drop and splitting with your clan mates, screenshot of loot and teammates names required as proof.\nRequires user to be an activated user\nPoint rewards: ${points_low}, ${points_medium} & ${points_high}`
		);
	}
	@Slash({
		name: 'activate',
		description: 'Information about activating clan members',
	})
	activate(interaction: CommandInteraction) {
		interaction.reply(
			`Admin only command, used to activate new member of the community. This command handles all automation for new users and allows them to gain points/ranks. This should be used on all new users that are a part of the clan.`
		);
	}
	@Slash({ name: 'github', description: 'Information about the bot' })
	github(interaction: CommandInteraction) {
		interaction.reply(
			'Link to Tectonic Bot repository: https://github.com/Miconen/tectonic-bot if you want to contribute @ Comfy hug'
		);
	}
}

@Discord()
@SlashGroup({
	name: 'rsn',
	description: 'Help for the rsn related commands',
	root: 'help',
})
@SlashGroup('rsn', 'help')
class HelpRsn {
	@Slash({ name: 'set', description: 'Information about setting your rsn' })
	set(interaction: CommandInteraction) {
		interaction.reply(
			'Temporarily admin only command, bind your osrs account(s) to your discord user.'
		);
	}
	@Slash({
		name: 'lookup',
		description: 'Information about other clan members osrs accounts',
	})
	lookup(interaction: CommandInteraction) {
		interaction.reply('Lookup discord users osrs account(s)');
	}
}
