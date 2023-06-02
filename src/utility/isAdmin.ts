import { ButtonInteraction, CommandInteraction, GuildMember, InteractionReplyOptions, PermissionsBitField } from "discord.js";
import { GuardFunction } from "discordx";

function hasPermissions(userPermissions: PermissionsBitField) {
    return userPermissions.has("ModerateMembers");
}

export const IsAdmin: GuardFunction<ButtonInteraction | CommandInteraction> = async (interaction, _, next) => {
    const member = interaction.member as GuildMember;
    const permissions = member.permissions as PermissionsBitField;

    console.log(`Checking permissions for: ${member.displayName} (${member.user.username}#${member.user.discriminator})`);
    if (hasPermissions(permissions)) {
        console.log("↳ Passed")
        await next();
    } else {
        console.log("↳ Denied")

        const warning: InteractionReplyOptions = {
            content: "You do not have the required permissions for this action",
            ephemeral: true,
        }
        interaction.reply(warning);
    }
}

export default IsAdmin;
