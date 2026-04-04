import type { CaRequest } from "@typings/requestTypes.js";
import { pendingRequests } from "@commands/requests/state.js";
import { Requests } from "@requests/main.js";
import { getGuildCAs } from "@utils/combatAchievement";
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
import { getSources } from "@utils/pointSources";

const caHelper = async (
  caName: string,
  members: GuildMember[],
  interaction: CommandInteraction,
  screenshot: string
) => {
  if (!interaction.channel)
    return await replyHandler(getString("errors", "noChannel"), interaction);
  if (!interaction.guild)
    return await replyHandler(getString("errors", "noGuild"), interaction);

  const userIds = members.map((m) => m.id);

  const usersRes = await Requests.getUsers(interaction.guild.id, {
    type: "user_id",
    user_id: userIds,
  });

  if (usersRes.error) {
    return await replyHandler(
      getString("errors", "fetchFailed", { resource: "users" }),
      interaction
    );
  }

  const alreadyCompleted: string[] = [];
  const newCompleters: string[] = [];

  for (const member of members) {
    const userData = usersRes.data.find((u) => u.user_id === member.id);
    if (!userData) {
      newCompleters.push(member.id);
      continue;
    }

    const hasCA = userData.combat_achievements?.some(
      (ca) => ca.name === caName
    );

    if (hasCA) {
      alreadyCompleted.push(member.id);
    } else {
      newCompleters.push(member.id);
    }
  }

  if (newCompleters.length === 0) {
    return await replyHandler(
      getString("ca", "allAlreadyCompleted"),
      interaction
    );
  }

  // Resolve point info from CA entry
  const cas = await getGuildCAs(interaction.guild.id);
  const caEntry = cas?.find((ca) => ca.name === caName);
  const points = caEntry?.points ?? 0;

  const sources = await getSources(interaction.guild.id);
  const pointSource = caEntry?.point_source ?? "";
  const sourceName = sources?.get(pointSource)?.name ?? pointSource;

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

  const alreadyMentions =
    alreadyCompleted.length > 0
      ? alreadyCompleted.map((id) => `<@${id}>`).join(", ")
      : "None";
  const newMentions = newCompleters.map((id) => `<@${id}>`).join(", ");

  await replyHandler(
    getString("ca", "requestSubmitted", {
      caName,
      requester: (interaction.member as GuildMember).displayName,
      sourceName,
      points,
      alreadyCompleted: alreadyMentions,
      newCompleters: newMentions,
      preview,
    }),
    interaction
  );

  const message = await interaction.editReply({
    components: [row],
    files: [screenshot],
  });

  const data: CaRequest = {
    type: "ca",
    caName,
    guildId: interaction.guild.id,
    members,
    alreadyCompleted,
    newCompleters,
    points,
    source: caEntry?.point_source ?? "Unknown",
    sourceName,
    channel: interaction.channel.id,
    message: message.id,
    screenshot,
    timestamp: Date.now(),
  };

  pendingRequests.set(interaction.id, data);
};

export default caHelper;
