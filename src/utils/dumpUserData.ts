import { AttachmentBuilder, type Client, type TextChannel } from "discord.js";
import { Requests } from "@requests/main.js";
import type { DetailedUser } from "@typings/api/user.js";

/**
 * Dumps a user's data as a JSON file to the first available channel,
 * preferring the log channel, then the mod channel.
 * Throws if neither channel is configured or the send fails.
 */
export async function dumpUserData(
  client: Client,
  guildId: string,
  userId: string,
  user: DetailedUser,
  reason: string
): Promise<void> {
  const guildRes = await Requests.getGuild(guildId);
  if (guildRes.error) {
    throw new Error(`Failed to fetch guild config: ${guildRes.message}`);
  }

  // Preference order: log channel -> mod channel
  const channelId =
    guildRes.data.log_channel_id ?? guildRes.data.mod_channel_id;
  if (!channelId) {
    throw new Error("No log or mod channel configured for guild");
  }

  const channel = (await client.channels.fetch(
    channelId
  )) as TextChannel | null;
  if (!channel) {
    throw new Error(`Could not resolve channel ${channelId}`);
  }

  const dump = Buffer.from(JSON.stringify(user, null, 2), "utf-8");
  const file = new AttachmentBuilder(dump, {
    name: `user-${userId}-${Date.now()}.json`,
  });

  await channel.send({
    content: `Dumping data of member before removal.  <@${userId}> (\`${userId}\`) Reason: ${reason}`,
    files: [file],
  });
}
