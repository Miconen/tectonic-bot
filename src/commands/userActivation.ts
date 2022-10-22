import {Discord, Slash, SlashOption} from 'discordx';
import {
    ApplicationCommandOptionType,
    CommandInteraction,
    GuildMember,
} from 'discord.js';
import IsAdmin from '../utility/isAdmin.js';
import newUser from '../data/database/newUser.js';
import removeUser from '../data/database/removeUser.js';
import getUser from '../data/database/getUser.js';
import {addRole, removeAllRoles} from '../data/roleHandling.js';

const isValid = async (interaction: CommandInteraction) => {
    if (!IsAdmin(Number(interaction.member?.permissions))) {
        await interaction.reply('❌ Lacking permissions for this command.');
        return false;
    }
    // TODO: Check if user is a bot

    return true;
};

@Discord()
class Activation {
    @Slash({
        name: 'activate',
        description:
            'Used for activating new guild members and giving access to rank points',
    })
    async Activate(
        @SlashOption({
            name: 'username',
            description: '@User tag to activate',
            required: true,
            type: ApplicationCommandOptionType.User,
        })
            user: GuildMember,
        interaction: CommandInteraction
    ) {
        if (!await isValid(interaction)) return;

        let result = await newUser(interaction.guildId!, user.user.id);

        let response: string;
        if (result) {
            response = `${user.user} has been activated by ${interaction.member}.`;
            // Set default role
            await addRole(interaction, user, 'jade');
        }
        else {
            response = `❌ ${user.user.username} is already activated.`;
        }
        // response = 'Error checking if user is activated';

        await interaction.reply(response);
    }

    @Slash({
        name: 'deactivate',
        description:
            'Deactivate and remove all points/data entries associated with a user',
    })
    async Deactivate(
        @SlashOption({
            name: 'username',
            description:
                '@User tag to deactivate, WARNING USERS POINTS WILL BE DELETED',
            required: true,
            type: ApplicationCommandOptionType.User,
        })
            user: GuildMember,
        interaction: CommandInteraction
    ) {
        if (!await isValid(interaction)) return;

        let result = await removeUser(interaction.guildId!, user.user.id);

        let response: string;
        if (result) {
            response = `✔ ${user.user.username} has been deactivated.`;
            // Remove all rank roles
            await removeAllRoles(interaction, user);
        } else {
            response = `❌ ${user.user.username} is not activated.`;
        }
        // response = 'Error checking if user is activated';

        await interaction.reply(response);
    }

    @Slash({
        name: 'checkstatus',
        description: 'Checks if a user is activated or not',
    })
    async Checkstatus(
        @SlashOption({
            name: 'username',
            description: '@User tag to check',
            required: true,
            type: ApplicationCommandOptionType.User,
        })
            user: GuildMember,
        interaction: CommandInteraction
    ) {
        if (!await isValid(interaction)) return;

        let result = await getUser(interaction.guildId!, user.user.id);

        let response: string;
        if (result) {
            response = `✔ ${user.user.username} is activated.`;
        } else {
            response = `❌ ${user.user.username} is not activated.`;
        }
        // response = 'Error checking if user is activated';

        await interaction.reply(response);
    }
}
