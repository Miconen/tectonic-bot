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
  interaction: CommandInteraction
) => {
  if (!interaction.guild) return getString("errors", "noGuild");
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

  // Show rank position if available from API
  const rankPrefix = user.rank ? `#${user.rank} ` : "";

  lines.push(
    getString("profile", "header", {
      rankIcon: currentRankIcon,
      username: target.displayName,
    }),
    getString("ranks", "rankInfoWithNext", {
      currentIcon: currentRankIcon,
      username: target.displayName,
      points,
      nextIcon: nextRankIcon,
      pointsToNext: nextRankUntil,
    })
  );
  if (currentRank === "wrath") {
    lines.push(
      getString("ranks", "rankInfo", {
        icon: currentRankIcon,
        username: target.displayName,
        points,
      })
    );
  }

  // Show leaderboard position
  if (user.rank) {
    lines.push(`> Leaderboard position: **${rankPrefix}**`);
  }

  if (user.rsns.length) {
    lines.push(getString("profile", "accountsHeader"));
    for (const account of user.rsns) {
      lines.push(getString("profile", "accountEntry", { rsn: account.rsn }));
    }
  } else {
    lines.push(`\`${getString("accounts", "noLinkedAccounts")}\``);
  }
  if (user.records.length) {
    lines.push(getString("profile", "pbsHeader"));
    for (const record of user.records) {
      const displayValue =
        record.value_type === "time"
          ? TimeConverter.ticksToTime(record.value)
          : `${record.value}`;
      lines.push(
        getString("profile", "pbEntry", {
          category: record.category,
          displayName: record.display_name,
          time: displayValue,
          ticks: record.value,
        })
      );
    }
  }
  // TODO: Also check if user has any events where placed below position_cutoff
  if (user.events.length) {
    lines.push(getString("profile", "eventsHeader"));
    for (const event of user.events) {
      // Skip events that are below the position cutoff
      if (event.position_cutoff < event.placement) continue;

      const isWinner = !event.solo && event.position_cutoff === 1;

      // Right side part of result string which shows the users placement
      const chunk = formatPlacement(event.placement, isWinner);

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
