import type { SplitRequest } from "@typings/requestTypes.js";
import { pendingRequests } from "@commands/requests/state.js";
import { getPoints, getSources } from "@utils/pointSources.js";
import { buildPlayerPreview } from "@utils/requestPreview.js";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type CommandInteraction,
  type GuildMember,
} from "discord.js";

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

  const confirm = new ButtonBuilder()
    .setCustomId("requestAccept")
    .setLabel("Accept")
    .setStyle(ButtonStyle.Success);

  const deny = new ButtonBuilder()
    .setCustomId("requestDeny")
    .setLabel("Deny")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    confirm,
    deny
  );

  const username = (interaction.member as GuildMember).displayName;
  await replyHandler(
    getString("splits", "requestSubmitted", {
      username,
      points,
      sourceName,
      preview,
    }),
    interaction
  );

  const message = await interaction.editReply({
    components: [row],
    files: [screenshot],
  });

  const data: SplitRequest = {
    type: "split",
    members,
    channel: interaction.channel.id,
    message: message.id,
    points,
    source,
    sourceName,
    screenshot,
    timestamp: Date.now(),
  };

  pendingRequests.set(interaction.id, data);
};

export default splitHelper;
