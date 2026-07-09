import { Discord, On, type ArgsOf } from "discordx";
import { Requests } from "@requests/main";
import { getLogger } from "@logging/context";
import { dumpUserData } from "@utils/dumpUserData";

@Discord()
class RemoveOnLeave {
  @On({ event: "guildMemberRemove" })
  async onGuildMemberRemove([member]: ArgsOf<"guildMemberRemove">) {
    const logger = getLogger();

    const guildId = member.guild.id;
    const userId = member.user.id;

    // Fetch BEFORE removal (removeUser purges the user's records/times)
    const res = await Requests.getUser(guildId, {
      type: "user_id",
      user_id: userId,
    });

    if (!res.error && res.data) {
      try {
        await dumpUserData(member.client, guildId, userId, res.data);
      } catch (e) {
        logger.warn(
          { err: e, userId, guildId },
          "Failed to dump leaving user's data"
        );
      }
    }

    await Requests.removeUser(guildId, {
      type: "user_id",
      user_id: userId,
    });
  }
}
