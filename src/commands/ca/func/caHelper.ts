import type { CaCache, CaData } from "@typings/caTypes.js";
import { Requests } from "@requests/main.js";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type CommandInteraction,
  type GuildMember,
  Collection,
} from "discord.js";

const caHelper = async (
  caName: string,
  members: GuildMember[],
  interaction: CommandInteraction,
  state: CaCache
) => {
  if (!interaction.channel)
    return await replyHandler(getString("errors", "noChannel"), interaction);
  if (!interaction.guild)
    return await replyHandler(getString("errors", "noGuild"), interaction);

  const userIds = members.map((m) => m.id);

  // Fetch detailed users to check CA completion status
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

  // Check which users already have this CA
  const alreadyCompleted: string[] = [];
  const newCompleters: string[] = [];

  for (const member of members) {
    const userData = usersRes.data.find((u) => u.user_id === member.id);
    if (!userData) {
      newCompleters.push(member.id);
      continue;
    }

    const hasCA = userData.combat_achievements?.some(
      (ca) => ca.name.toLowerCase() === caName.toLowerCase()
    );

    if (hasCA) {
      alreadyCompleted.push(member.id);
    } else {
      newCompleters.push(member.id);
    }
  }

  // If all users already have the CA, deny
  if (newCompleters.length === 0) {
    return await replyHandler(
      getString("ca", "allAlreadyCompleted"),
      interaction
    );
  }

  const confirm = new ButtonBuilder()
    .setCustomId("caButtonAccept")
    .setLabel("Accept")
    .setStyle(ButtonStyle.Success);

  const deny = new ButtonBuilder()
    .setCustomId("caButtonDeny")
    .setLabel("Deny")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    confirm,
    deny
  );

  const playerMentions = members.map((m) => `<@${m.id}>`).join(", ");
  const alreadyMentions =
    alreadyCompleted.length > 0
      ? alreadyCompleted.map((id) => `<@${id}>`).join(", ")
      : "None";
  const newMentions = newCompleters.map((id) => `<@${id}>`).join(", ");

  await replyHandler(
    getString("ca", "requestSubmitted", {
      caName,
      requester: (interaction.member as GuildMember).displayName,
      players: playerMentions,
      alreadyCompleted: alreadyMentions,
      newCompleters: newMentions,
    }),
    interaction
  );

  const message = await interaction.editReply({ components: [row] });

  const data: CaData = {
    caName,
    guildId: interaction.guild.id,
    members,
    userIds,
    alreadyCompleted,
    newCompleters,
    channel: interaction.channel.id,
    message: message.id,
    timestamp: Date.now(),
  };

  state.set(interaction.id, data);
};

export default caHelper;
