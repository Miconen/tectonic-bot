import type { PbRequest } from "@typings/requestTypes";
import { postRequest } from "@commands/requests/postRequest";
import { Requests } from "@requests/main";
import { getPoints, getSources } from "@utils/pointSources";
import { buildPlayerPreview } from "@utils/requestPreview";
import { replyHandler } from "@utils/replyHandler";
import { getString } from "@utils/stringRepo";
import TimeConverter from "./TimeConverter";
import { Bosses } from "./getBosses";
import { formatValueLabel } from "./valueFormat";
import type { CommandInteraction, GuildMember } from "discord.js";

const pbRequestHelper = async (
  boss: string,
  input: string,
  team: string[],
  screenshot: string,
  interaction: CommandInteraction
) => {
  if (!interaction.channel)
    return await replyHandler(getString("errors", "noChannel"), interaction);
  if (!interaction.guild)
    return await replyHandler(getString("errors", "noGuild"), interaction);

  // Resolve boss metadata to determine value type
  const bossData = Bosses.get(boss);
  const valueType = bossData?.value_type ?? "time";
  const higherIsBetter = valueType !== "time";

  // Parse input based on value type
  let value: number;
  if (valueType === "time") {
    const ticks = TimeConverter.timeToTicks(input);
    if (!ticks) {
      return await replyHandler(
        getString("times", "failedParsingTicks"),
        interaction
      );
    }
    value = ticks;
  } else {
    value = Number.parseInt(input, 10);
    if (Number.isNaN(value) || value < 1) {
      return await replyHandler(
        getString("times", "failedParsingTicks"),
        interaction
      );
    }
  }

  const guildTimes = await Requests.getGuildTimes(interaction.guild.id);
  if (!guildTimes.error && guildTimes.data?.records) {
    const currentPb = guildTimes.data.records.find(
      (r) => r.boss_name === boss && r.position === 1
    );
    if (currentPb) {
      const isWorse = higherIsBetter
        ? value <= currentPb.value
        : value >= currentPb.value;

      const displayCurrent =
        valueType === "time"
          ? TimeConverter.ticksToTime(currentPb.value)
          : `${currentPb.value}`;
      const displayNew =
        valueType === "time" ? TimeConverter.ticksToTime(value) : `${value}`;

      if (isWorse) {
        return await replyHandler(
          getString("pb", "notFaster", {
            valueLabel: formatValueLabel(valueType).toLowerCase(),
            time: displayNew,
            currentTime: displayCurrent,
          }),
          interaction
        );
      }
    }
  }

  const points = (await getPoints("clan_pb", interaction.guild.id)) ?? 0;
  const sources = await getSources(interaction.guild.id);
  const sourceName = sources?.get("clan_pb")?.name ?? "Clan PB";

  const bossTitle = `${bossData?.category}: ${bossData?.display_name}`;

  const fetchedMembers = await interaction.guild.members.fetch({ user: team });
  const membersArray = [...fetchedMembers.values()];

  const preview = await buildPlayerPreview(
    interaction.guild.id,
    membersArray,
    points
  );

  const valueLabel = formatValueLabel(valueType);
  const displayValue =
    valueType === "time"
      ? `${TimeConverter.ticksToTime(value)} (${value} ticks)`
      : `${value}`;

  const content = getString("pb", "requestSubmitted", {
    username: (interaction.member as GuildMember).displayName,
    bossTitle,
    valueLabel,
    displayValue,
    sourceName,
    points,
    preview,
  });

  const data: PbRequest = {
    type: "pb",
    boss,
    bossTitle,
    time: input,
    team,
    points,
    source: "clan_pb",
    sourceName,
    screenshot,
    timestamp: Date.now(),
    channel: "",
    message: "",
  };

  await postRequest(content, data, interaction);
};

export default pbRequestHelper;
