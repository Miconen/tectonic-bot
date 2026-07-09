import type { CaRequest } from "@typings/requestTypes.js";
import { postRequest } from "@commands/requests/postRequest.js";
import { Requests } from "@requests/main.js";
import { getGuildCAs } from "@utils/combatAchievement";
import { getSources } from "@utils/pointSources.js";
import { buildPlayerPreview } from "@utils/requestPreview.js";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import type { CommandInteraction, GuildMember } from "discord.js";

const caHelper = async (
  caName: string,
  members: GuildMember[],
  interaction: CommandInteraction<"cached">,
  screenshot: string
) => {
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

  const cas = await getGuildCAs(interaction.guild.id);
  const caEntry = cas?.find((ca) => ca.name === caName);
  const sources = await getSources(interaction.guild.id);
  const pointSource = caEntry?.point_source ?? "";
  const sourceName = sources?.get(pointSource)?.name ?? pointSource;
  const points = caEntry?.points ?? 0;

  const preview = await buildPlayerPreview(
    interaction.guild.id,
    members,
    points
  );

  const alreadyMentions =
    alreadyCompleted.length > 0
      ? alreadyCompleted.map((id) => `<@${id}>`).join(", ")
      : "None";
  const newMentions = newCompleters.map((id) => `<@${id}>`).join(", ");

  const content = getString("ca", "requestSubmitted", {
    caName,
    requester: (interaction.member as GuildMember).displayName,
    sourceName,
    points,
    alreadyCompleted: alreadyMentions,
    newCompleters: newMentions,
    preview,
  });

  const data: CaRequest = {
    type: "ca",
    caName,
    guildId: interaction.guild.id,
    members,
    alreadyCompleted,
    newCompleters,
    points,
    source: pointSource,
    sourceName,
    screenshot,
    timestamp: Date.now(),
    channel: "",
    message: "",
  };

  await postRequest(content, data, interaction);
};

export default caHelper;
