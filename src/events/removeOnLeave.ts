import { Discord, On, ArgsOf } from "discordx";

@Discord()
class removeOnLeave {
  @On({ event: "guildMemberRemove" })
  onguildMemberRemove(
    [message]: ArgsOf<"guildMemberRemove">,
  ) {
    // Remove user from database
    Requests.removeUser(message.guild.id, message.user.id)
  }
}


