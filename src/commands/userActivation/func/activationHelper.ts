import type {CommandInteraction, GuildMember} from "discord.js";
import type IRankService from "../../../utils/rankUtils/IRankService"
import type IDatabase from "../../../database/IDatabase";

import { container } from "tsyringe"

const activationHelper = async (user: GuildMember, interaction: CommandInteraction) => {
    const rankService = container.resolve<IRankService>("RankService")
    const database = container.resolve<IDatabase>("Database")

    let result = await database.newUser(interaction.guildId!, user.user.id);

    let response: string;
    if (result) {
        response = `**${user.user}** has been activated by **${interaction.member}**.`;
        // Set default role
        await rankService.addRole(interaction, user, 'jade');
    }
    else {
        response = `❌ **${user.displayName}** is already activated.`;
    }
    // response = 'Error checking if user is activated';

    await interaction.reply(response);
}

export default activationHelper;
