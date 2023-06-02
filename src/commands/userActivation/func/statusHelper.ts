import {CommandInteraction, GuildMember} from "discord.js";
import getUser from "../../../database/getUser.js"

const statusHelper = async (user: GuildMember, interaction: CommandInteraction) => {
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
