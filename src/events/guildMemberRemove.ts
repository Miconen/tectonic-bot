import { Discord, On, ArgsOf } from "discordx";
import type IDatabase from "@database/IDatabase"
import { container } from "tsyringe"

@Discord()
class guildMemberRemove {
  @On({ event: "guildMemberRemove" })
  onguildMemberRemove(
    [message]: ArgsOf<"guildMemberRemove">,
  ) {

    // Remove user from database
    const database = container.resolve<IDatabase>("Database")
    database.removeUser(message.guild.id,message.user.id)

    // TODO: swap to the api
  }
}


