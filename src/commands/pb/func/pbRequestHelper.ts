import type { PbRequest } from "@typings/requestTypes.js";
import { postRequest } from "@commands/requests/postRequest.js";
import { Requests } from "@requests/main.js";
import { getPoints, getSources } from "@utils/pointSources.js";
import { buildPlayerPreview } from "@utils/requestPreview.js";
import { replyHandler } from "@utils/replyHandler.js";
import { getString } from "@utils/stringRepo.js";
import TimeConverter from "./TimeConverter.js";
import { Bosses } from "./getBosses.js";
import { formatValueLabel } from "./valueFormat.js";
import type { CommandInteraction, GuildMember } from "discord.js";

const pbRequestHelper = async (
  boss: string,
  input: string,
  team: string[],
  screenshot: string,
  interaction: CommandInteraction<"cached">
) => {
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
    const positionCount = guildTimes.data.position_count ?? 3;

    // Find all records for this boss, sorted by position
    const bossRecords = guildTimes.data.records
      .filter((r) => r.boss_name === boss)
      .sort((a, b) => a.position - b.position);

    // If the boss already has max positions filled, compare against the last one
    if (bossRecords.length >= positionCount) {
      const lastRecord = bossRecords[bossRecords.length - 1];

      const isWorse = higherIsBetter
        ? value <= lastRecord.value
        : value >= lastRecord.value;

      if (isWorse) {
        const displayCurrent =
          valueType === "time"
            ? TimeConverter.ticksToTime(lastRecord.value)
            : `${lastRecord.value}`;
        const displayNew =
          valueType === "time" ? TimeConverter.ticksToTime(value) : `${value}`;

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
    // If fewer records than position_count, the submission will always qualify
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
