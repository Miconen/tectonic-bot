import type { CommandInteraction, GuildMember } from "discord.js";
import type IRankService from "@utils/rankUtils/IRankService";
import { Requests } from "@requests/main.js";
import type { UserParam } from "@typings/api/user";

import { container } from "tsyringe";
import TimeConverter from "@commands/pb/func/TimeConverter";
import { getString } from "@utils/stringRepo";
import { formatPlacement } from "@utils/formatEventPlacement";

const pointsHelper = async (
  member: GuildMember | null,
  rsn: string | null,
  interaction: CommandInteraction<"cached">
) => {
  const guildId = interaction.guild.id;

  const rankService = container.resolve<IRankService>("RankService");

  let target = member;
  let query: UserParam | undefined;
  let errorMsg = getString("profile", "criticalError");

  if (!target) {
    target = interaction.member as GuildMember;
  }

  // User wants to check self
  if (!rsn) {
    query = { type: "user_id", user_id: target.id };
    errorMsg = getString("accounts", "notActivated", {
      username: target.displayName,
    });
  }

  // Checks the database for an rns
  if (rsn) {
    query = { type: "rsn", rsn };
    errorMsg = getString("errors", "rsnNotBound", { rsn });
  }

  if (!query) {
    return errorMsg;
  }

  const res = await Requests.getUser(guildId, query);
  if (res.error || !res.data) return errorMsg;

  target = await interaction.guild.members.fetch(res.data.user_id);

  const user = res.data;
  const points = user.points;

  // Use API-provided tier if available, fall back to hardcoded RankService
  const currentRankIcon =
    user.tier?.icon ?? rankService.getIcon(rankService.getRankByPoints(points));
  const currentRank = user.tier?.name ?? rankService.getRankByPoints(points);

  // Compute next rank info
  const nextRankUntil = rankService.pointsToNextRank(points);
  const nextRank = rankService.getRankByPoints(points + nextRankUntil);
  const nextRankIcon = rankService.getIcon(nextRank);

  const lines: string[] = [];

  const rankPrefix = user.rank ? `#${user.rank}` : "?";

  // Calculate valid events for the count
  const validEvents = user.events.filter(
    (e) => e.position_cutoff >= e.placement
  );

  const guildTimesRes = await Requests.getGuildTimes(guildId);
  const guildRecords =
    !guildTimesRes.error && guildTimesRes.data?.records
      ? guildTimesRes.data.records
      : [];
  const guildTeammates =
    !guildTimesRes.error && guildTimesRes.data?.teammates
      ? guildTimesRes.data.teammates
      : [];

  // Find all record_ids the user was part of
  const userRecordIds = new Set(
    guildTeammates
      .filter((t) => t.user_id === target.id)
      .map((t) => t.record_id)
  );

  // Filter guild records to only those the user is in
  const userGuildRecords = guildRecords.filter((r) =>
    userRecordIds.has(r.record_id)
  );

  // Deduplicate by boss_name: keep the one with the best (lowest) position
  const bestRecordsByBoss = new Map<string, (typeof userGuildRecords)[0]>();
  for (const r of userGuildRecords) {
    const existing = bestRecordsByBoss.get(r.boss_name);
    if (!existing || r.position < existing.position) {
      bestRecordsByBoss.set(r.boss_name, r);
    }
  }

  const recordsToDisplay = user.records
    .filter((r) =>
      Array.from(bestRecordsByBoss.values()).some(
        (b) => b.record_id === r.record_id
      )
    )
    .map((r) => {
      const clanRecord = bestRecordsByBoss.get(r.boss_name);
      return {
        ...r,
        position: clanRecord?.position ?? "?",
      };
    });

  lines.push(
    getString("profile", "header", {
      rankIcon: currentRankIcon,
      username: target.displayName,
      rankPrefix,
      points,
      pbCount: recordsToDisplay.length,
      eventCount: validEvents.length,
      nextRankIcon,
      pointsToNext: nextRankUntil > 0 ? nextRankUntil.toString() : "0",
    })
  );

  if (user.rsns.length) {
    lines.push(getString("profile", "accountsHeader"));
    for (const account of user.rsns) {
      lines.push(getString("profile", "accountEntry", { rsn: account.rsn }));
    }
  } else {
    lines.push(`\`${getString("accounts", "noLinkedAccounts")}\``);
  }

  if (recordsToDisplay.length) {
    lines.push(getString("profile", "pbsHeader"));
    for (const record of recordsToDisplay) {
      const displayValue =
        record.value_type === "time"
          ? TimeConverter.ticksToTime(record.value)
          : `${record.value}`;
      lines.push(
        getString("profile", "pbEntry", {
          category: record.category,
          displayName: record.display_name,
          position: record.position,
          displayValue,
        })
      );
    }
  }

  if (validEvents.length) {
    lines.push(getString("profile", "eventsHeader"));
    for (const event of validEvents) {
      const isLegacy = event.wom_id.startsWith("legacy_");
      const isWinner =
        (!event.solo && event.position_cutoff === 1) ||
        (isLegacy && event.placement === 1);

      let chunk = formatPlacement(event.placement, isWinner);

      lines.push(
        getString("profile", "eventEntry", {
          eventName: event.name,
          womId: event.wom_id,
          chunk,
        })
      );
    }
  }

  if (user.achievements.length) {
    lines.push(getString("profile", "achievementsHeader"));
    for (const achievement of user.achievements) {
      lines.push(
        getString("profile", "achievementEntry", {
          icon: achievement.discord_icon,
          name: achievement.name,
        })
      );
    }
  }

  return lines.join("\n");
};

export default pointsHelper;
