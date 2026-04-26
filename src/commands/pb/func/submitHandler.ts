import type { CommandInteraction } from "discord.js";
import { Requests } from "@requests/main";

import TimeConverter from "./TimeConverter";
import updateEmbed from "./updateEmbed";
import { getString } from "@utils/stringRepo";
import { getPoints, getSources } from "@utils/pointSources";
import giveHelper from "@commands/moderation/func/giveHelper";
import { getLogger } from "@logging/context";
import { Bosses } from "./getBosses";
import { formatValueLabel } from "./valueFormat";

async function submitHandler(
  boss: string,
  input: string,
  team: string[],
  interaction: CommandInteraction
) {
  if (!interaction.guild) {
    return getString("errors", "noGuild");
  }
  const guildId = interaction.guild.id;
  const logger = getLogger();

  // Resolve boss metadata to determine value type
  const bossData = Bosses.get(boss);
  const valueType = bossData?.value_type ?? "time";

  // Parse input based on value type
  let value: number;
  if (valueType === "time") {
    const ticks = TimeConverter.timeToTicks(input);
    if (!ticks) {
      const response = getString("times", "failedParsingTicks");
      logger.error(response);
      return response;
    }
    value = ticks;
  } else {
    value = Number.parseInt(input, 10);
    if (Number.isNaN(value) || value < 1) {
      return getString("times", "failedParsingTicks");
    }
  }

  // Add record
  const res = await Requests.newTime(guildId, {
    user_ids: team,
    value,
    boss_name: boss,
  });
  if (res.error) {
    const response = getString("times", "failedAddingTime");
    logger.error({ err: res.message }, response);
    return response;
  }

  // Check if the record didn't make the top positions
  if (res.data.position === null || res.data.position === undefined) {
    return getString("times", "timeSubmittedNotPb");
  }

  // Pb updated
  const success = await updateEmbed(boss, interaction);
  if (!success) {
    await interaction.followUp({
      content: getString("times", "failedUpdatingEmbed"),
      ephemeral: true,
    });
  }
  logger.info(res.data, "New clan best record");

  // Resolve boss metadata for header
  const bossTitle = `${bossData?.category}: ${bossData?.display_name}`;

  // Resolve source info
  const points = (await getPoints("clan_pb", guildId)) ?? 0;
  const sources = await getSources(guildId);
  const sourceName = sources?.get("clan_pb")?.name ?? "Clan PB";

  // Fetch and map user ids to GuildMember types
  const members = await interaction.guild.members.fetch({ user: team });
  const pointsResponses: string[] = [];

  if (!members) {
    pointsResponses.push(getString("times", "errorFetchingUsersForPoints"));
  }

  // Give points
  pointsResponses.push(await giveHelper(members, "clan_pb", interaction));

  // Construct response
  const valueLabel = formatValueLabel(valueType);
  const displayValue =
    valueType === "time"
      ? `${TimeConverter.ticksToTime(res.data.value)} (${res.data.value} ticks)`
      : `${res.data.value}`;
  const response: string[] = [
    getString("times", "newPb", {
      bossTitle,
      valueLabel,
      displayValue,
      sourceName,
      points,
    }),
  ];
  response.push(pointsResponses.join("\n"));

  return response.join("\n");
}

export default submitHandler;
