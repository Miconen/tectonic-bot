import {CommandInteraction, GuildMember} from "discord.js";
import * as rankUtils from "../../../utils/rankUtils/index.js";
import newUser from "../../../database/newUser.js"

const activationHelper = async (user: GuildMember, interaction: CommandInteraction) => {
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
