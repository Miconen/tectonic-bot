import type { GuildMember } from "discord.js";
import { Requests } from "@requests/main.js";
import { container } from "tsyringe";
import type IRankService from "@utils/rankUtils/IRankService.js";
import { getLogger } from "@logging/context.js";
import { formatDisplayName } from "./formatDisplayName";

export async function buildPlayerPreview(
  guildId: string,
  members: GuildMember[],
  points: number
): Promise<string> {
  const logger = getLogger();
  const rankService = container.resolve<IRankService>("RankService");

  const userIds = members.map((m) => m.id);
  const res = await Requests.getUsers(guildId, {
    type: "user_id",
    user_id: userIds,
  });

  const lines: string[] = ["**If approved:**"];

  for (const member of members) {
    const userData = !res.error
      ? res.data.find((u) => u.user_id === member.id)
      : undefined;

    if (!userData) {
      lines.push(`<@${member.id}>`);
      continue;
    }

    const oldPoints = userData.points;
    const newPoints = oldPoints + points;
    const oldRank = rankService.getRankByPoints(oldPoints);
    const newRank = rankService.getRankByPoints(newPoints);
    const oldIcon = rankService.getIcon(oldRank);
    const newIcon = rankService.getIcon(newRank);

    const rankChanged = oldRank !== newRank;

    let line = `<@${member.id}> (${oldPoints} ${oldIcon} → ${newPoints} ${newIcon})`;
    if (rankChanged) {
      const direction = points >= 0 ? "Ranks up" : "Ranks down";
      line += ` ${direction} to ${newIcon} ${formatDisplayName(newRank)}`;
    }
    lines.push(line);
  }

  return lines.join("\n");
}
