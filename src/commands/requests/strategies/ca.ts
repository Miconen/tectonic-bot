import { Requests } from "@requests/main";
import { getString } from "@utils/stringRepo";
import type { RequestStrategy } from "./strategies";
import type { CaRequest } from "@typings/requestTypes";
import type IRankService from "@utils/rankUtils/IRankService";
import { container } from "tsyringe";
import { formatDisplayName } from "@utils/formatDisplayName";

export const caStrategy: RequestStrategy<CaRequest> = {
  async accept(interaction, data) {
    if (!interaction.guild) return getString("errors", "noGuild");

    const rankService = container.resolve<IRankService>("RankService");

    const res = await Requests.completeCombatAchievement(
      data.guildId,
      data.caName,
      data.members.map((m) => m.id)
    );

    if (res.error) return getString("errors", "givingPoints");

    const response: string[] = [
      getString("ca", "approved", {
        sourceName: data.sourceName,
        points: data.points,
      }),
    ];

    for (const u of res.data) {
      const member = data.members.find((m) => m.id === u.user_id);
      if (!member) continue;

      const oldPoints = u.points - u.given_points;
      const newPoints = u.points;
      const oldRank = rankService.getRankByPoints(oldPoints);
      const newRank = rankService.getRankByPoints(newPoints);
      const oldIcon = rankService.getIcon(oldRank);
      const newIcon = rankService.getIcon(newRank);

      const rankChanged = oldRank !== newRank;

      if (rankChanged) {
        await rankService.rankUpHandler(
          interaction,
          member,
          oldPoints,
          newPoints
        );

        const template =
          u.given_points >= 0 ? "pointsGrantedRankUp" : "pointsGrantedRankDown";

        response.push(
          getString("ranks", template, {
            username: member.displayName,
            pointsGiven: u.given_points,
            oldPoints,
            newPoints,
            oldIcon,
            newIcon,
            rankName: formatDisplayName(newRank),
          })
        );
      } else {
        response.push(
          getString("ranks", "pointsGranted", {
            username: member.displayName,
            pointsGiven: u.given_points,
            oldPoints,
            newPoints,
            icon: newIcon,
          })
        );
      }
    }

    return response;
  },
  denyMessage(data) {
    return getString("ca", "denied", {
      sourceName: data.sourceName,
      points: data.points,
      caName: data.caName,
    });
  },
  label(data) {
    return `CA: ${data.caName} | ${data.points}pts — ${data.members.length} players`;
  },
};
