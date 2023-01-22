import {CommandInteraction, GuildMember} from "discord.js";
import * as rankUtils from "../../../utility/rankUtils/index.js";
import IsAdmin from "../../../utility/isAdmin.js";
import removeUser from "../../../database/removeUser.js"

const isValid = async (interaction: CommandInteraction) => {
    if (!IsAdmin(Number(interaction.member?.permissions))) {
        await interaction.reply('❌ Lacking permissions for this command.');
        return false;
    }
    return true;
};

const deactivationHelper = async (user: GuildMember, interaction: CommandInteraction) => {
    if (!await isValid(interaction)) return;

    let result = await removeUser(interaction.guildId!, user.user.id);

    let response: string;
    if (result) {
        response = `✔ **${user.displayName}** has been deactivated.`;
        // Remove all rank roles
        await rankUtils.removeOldRoles(user);
    } else {
        response = `❌ **${user.displayName}** is not activated.`;
    }
    // response = 'Error checking if user is activated';

    await interaction.reply(response);
}

export default deactivationHelper;