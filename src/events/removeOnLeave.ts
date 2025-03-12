import { Discord, On, type ArgsOf } from "discordx";
import { Requests } from "@requests/main.js";

@Discord()
class removeOnLeave {
	@On({ event: "guildMemberRemove" })
	async onguildMemberRemove([message]: ArgsOf<"guildMemberRemove">) {
		// Remove user from database
		await Requests.removeUser(message.guild.id, {
			type: "user_id",
			user_id: message.user.id,
		});
	}
}
