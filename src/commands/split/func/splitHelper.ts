import type { SplitRequest } from "@typings/requestTypes.js";
import { postRequest } from "@commands/requests/postRequest.js";
import { getPoints, getSources } from "@utils/pointSources.js";
import { buildPlayerPreview } from "@utils/requestPreview.js";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import type { CommandInteraction, GuildMember } from "discord.js";

const splitHelper = async (
  source: string,
  members: GuildMember[],
  interaction: CommandInteraction,
  screenshot: string
) => {
  if (!interaction.channel)
    return await replyHandler(getString("errors", "noChannel"), interaction);
  if (!interaction.guild)
    return await replyHandler(getString("errors", "noGuild"), interaction);

  const points = (await getPoints(source, interaction.guild.id)) ?? 0;
  const sources = await getSources(interaction.guild.id);
  const sourceName = sources?.get(source)?.name ?? source;

  const preview = await buildPlayerPreview(
    interaction.guild.id,
    members,
    points
  );

  const username = (interaction.member as GuildMember).displayName;
  const content = getString("splits", "requestSubmitted", {
    username,
    points,
    sourceName,
    preview,
  });

  const data: SplitRequest = {
    type: "split",
    members,
    points,
    source,
    sourceName,
    screenshot,
    timestamp: Date.now(),
    channel: "",
    message: "",
  };

  await postRequest(content, data, interaction);
};

export default splitHelper;
