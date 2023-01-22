import {CommandInteraction, GuildMember} from "discord.js";
import IsAdmin from "../../../utility/isAdmin.js";
import getUser from "../../../database/getUser.js"

const isValid = async (interaction: CommandInteraction) => {
    if (!IsAdmin(Number(interaction.member?.permissions))) {
        await interaction.reply('❌ Lacking permissions for this command.');
        return false;
    }
    return true;
};

const statusHelper = async (user: GuildMember, interaction: CommandInteraction) => {
    if (!await isValid(interaction)) return;

    let result = await getUser(interaction.guildId!, user.user.id);

    let response: string;
    if (result) {
        response = `✔ **${user.displayName}** is activated.`;
    } else {
        response = `❌ **${user.displayName}** is not activated.`;
    }
    // response = 'Error checking if user is activated';

    await interaction.reply(response);
}

export default statusHelper;