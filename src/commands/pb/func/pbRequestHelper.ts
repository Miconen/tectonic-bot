import type { PbRequest } from "@typings/requestTypes.js";
import { pendingRequests } from "@commands/requests/state.js";
import { Requests } from "@requests/main.js";
import { getPoints, getSources } from "@utils/pointSources.js";
import { buildPlayerPreview } from "@utils/requestPreview.js";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import TimeConverter from "./TimeConverter.js";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type CommandInteraction,
  type GuildMember,
} from "discord.js";
import { Bosses } from "./getBosses.js";

const pbRequestHelper = async (
  boss: string,
  time: string,
  team: string[],
  screenshot: string,
  interaction: CommandInteraction
) => {
  if (!interaction.channel)
    return await replyHandler(getString("errors", "noChannel"), interaction);
  if (!interaction.guild)
    return await replyHandler(getString("errors", "noGuild"), interaction);

  const ticks = TimeConverter.timeToTicks(time);
  if (!ticks) {
    return await replyHandler(
      getString("times", "failedParsingTicks"),
      interaction
    );
  }

  const guildTimes = await Requests.getGuildTimes(interaction.guild.id);
  if (!guildTimes.error && guildTimes.data?.pbs) {
    const currentPb = guildTimes.data.pbs.find((pb) => pb.boss_name === boss);
    if (currentPb && ticks >= currentPb.time) {
      return await replyHandler(
        getString("pb", "notFaster", {
          time: TimeConverter.ticksToTime(ticks),
          currentTime: TimeConverter.ticksToTime(currentPb.time),
        }),
        interaction
      );
    }
  }

  const points = (await getPoints("clan_pb", interaction.guild.id)) ?? 0;
  const sources = await getSources(interaction.guild.id);
  const sourceName = sources?.get("clan_pb")?.name ?? "Clan PB";

  const fetchedMembers = await interaction.guild.members.fetch({ user: team });
  const membersArray = [...fetchedMembers.values()];

  const preview = await buildPlayerPreview(
    interaction.guild.id,
    membersArray,
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

  const bossData = Bosses.get(boss);
  const bossTitle = `${bossData?.category}: ${bossData?.display_name}`;

  await replyHandler(
    getString("pb", "requestSubmitted", {
      username: (interaction.member as GuildMember).displayName,
      bossTitle,
      time: `${TimeConverter.ticksToTime(ticks)} (${ticks} ticks)`,
      sourceName,
      points,
      preview,
    }),
    interaction
  );

  const message = await interaction.editReply({
    components: [row],
    files: [screenshot],
  });

  const data: PbRequest = {
    type: "pb",
    boss,
    bossTitle,
    time,
    team,
    points,
    source: "clan_pb",
    sourceName,
    channel: interaction.channel.id,
    message: message.id,
    screenshot,
    timestamp: Date.now(),
  };

  pendingRequests.set(interaction.id, data);
};

export default pbRequestHelper;
