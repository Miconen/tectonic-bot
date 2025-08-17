import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import type {
	ButtonInteraction,
	CommandInteraction,
	GuildMember,
	InteractionReplyOptions,
	PermissionsBitField,
} from "discord.js";
import type { GuardFunction } from "discordx";

function hasPermissions(userPermissions: PermissionsBitField) {
	return userPermissions.has("ModerateMembers");
}

export const IsAdmin: GuardFunction<
	ButtonInteraction | CommandInteraction
> = async (interaction, _, next) => {
	const member = interaction.member as GuildMember;
	const permissions = member.permissions as PermissionsBitField;

	console.log(
		`Checking permissions for: ${member.displayName} (${member.user.username}#${member.user.discriminator})`,
	);
	if (hasPermissions(permissions)) {
		console.log("↳ Passed");
		await next();
	} else {
		console.log("↳ Denied");

		await replyHandler(getString("permissions", "adminRequired"), interaction);
	}
};

export default IsAdmin;
