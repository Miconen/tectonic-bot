import { Discord, Slash, SlashOption } from 'discordx';
import {
    ApplicationCommandOptionType,
    CommandInteraction,
    GuildMember,
} from 'discord.js';
import profileHelper from "./func/profileHelper.js";

@Discord()
class Profile {
    @Slash({
        name: 'profile',
        description: 'Check your or someone elses profile',
    })
    async points(
        @SlashOption({
            name: 'username',
            description:
                'Leave blank to check personal profile or supply a name to check another user.',
            required: false,
            type: ApplicationCommandOptionType.User,
        })
        user: GuildMember | null,
        interaction: CommandInteraction
    ) {
        const response = await profileHelper(user, interaction);
        await interaction.reply(response);
    }
}
