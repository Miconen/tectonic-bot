import { Discord, Slash, SlashOption } from 'discordx';
import {
    ApplicationCommandOptionType,
    CommandInteraction,
    GuildMember,
} from 'discord.js';
import profileHelper from "./func/profileHelper.js";

@Discord()
class profile {
    @Slash({
        name: 'profile',
        description: 'Check your or someone elses profile',
    })
    async points(
        //this 
        @SlashOption({
            name: 'username',
            description:
                'Leave blank to check personal profile or supply a name to check another user.',
            required: false,
            type: ApplicationCommandOptionType.User,
        })
        // or this
        user: GuildMember | string | null,
        @SlashOption({
            name: 'rsn',
            description:
                'an rsn coneccted to the profile.',
            required: false,
            type: ApplicationCommandOptionType.String,
        })
        rsn: GuildMember | string | null,
        interaction: CommandInteraction
    ) {
        
        const response = await profileHelper(user ?? rsn ?? null, interaction);
        await interaction.reply(response);
    }
}
