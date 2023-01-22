import {CommandInteraction, GuildMember} from "discord.js";
import * as rankUtils from "../../../utility/rankUtils/index.js";
import IsAdmin from "../../../utility/isAdmin.js";
import newUser from "../../../database/newUser.js"

const isValid = async (interaction: CommandInteraction) => {
    if (!IsAdmin(Number(interaction.member?.permissions))) {
        await interaction.reply('❌ Lacking permissions for this command.');
        return false;
    }
    return true;
};

const activationHelper = async (user: GuildMember, interaction: CommandInteraction) => {
    if (!await isValid(interaction)) return;

    let result = await newUser(interaction.guildId!, user.user.id);

    let response: string;
    if (result) {
        response = `**${user.user}** has been activated by **${interaction.member}**.`;
        // Set default role
        await rankUtils.addRole(interaction, user, 'jade');
    }
    else {
        response = `❌ **${user.displayName}** is already activated.`;
    }
    // response = 'Error checking if user is activated';

    await interaction.reply(response);
}

export default activationHelper;