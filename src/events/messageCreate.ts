import IsActivated from "../guards/IsActivated.js"
import { GuildMember } from "discord.js";
import { Discord, On, Client, ArgsOf, Guard } from "discordx";
/*
@Discord()
class guildMemberRemove {
  @On({ event: "messageCreate" })
  onguildMemberRemove(
    [message]: ArgsOf<"messageCreate">, // Type message automatically
    client: Client, // Client instance injected here,
  ) {
   // Test 

    // Remove user from database
    // api endpoint remove user by user_id/guild_id
  }
}
*/