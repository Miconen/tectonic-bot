import { Discord, Slash, SlashOption, SlashGroup } from 'discordx';
import { CommandInteraction, User, EmbedBuilder, GuildMember } from 'discord.js';
import getPoints from '../data/database/getPoints.js';

@Discord()
class Points {
    @Slash('points')
    points (
        @SlashOption('username', {
            description: 'Leave blank to check personal points or supply a name to check another user.',
            required: false
        })
        user: GuildMember,
        interaction: CommandInteraction
    ) {
        let targetUser = user?.user?.id ?? interaction.user.id
        let result = getPoints(
            interaction.guildId!,
            targetUser
        );

        result
            .then((points) => {
                interaction.reply(`${points} points`);
            })
            .catch((err) => {
                interaction.reply('Error getting points, selected user is not activated');
            });
    } 
}
