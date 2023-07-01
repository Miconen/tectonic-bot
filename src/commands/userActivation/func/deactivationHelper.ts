import {CommandInteraction, GuildMember} from "discord.js";
import * as rankUtils from "../../../utils/rankUtils/index.js";
import removeUser from "../../../database/removeUser.js"

const deactivationHelper = async (user: GuildMember, interaction: CommandInteraction) => {
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
