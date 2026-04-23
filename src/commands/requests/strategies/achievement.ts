import { Requests } from "@requests/main";
import type { AchievementParam } from "@typings/api/achievement";
import type { AchievementRequest } from "@typings/requestTypes";
import { invalidateUserCache } from "@utils/pickers";
import { getString } from "@utils/stringRepo";
import type { RequestStrategy } from "./strategies";

export const achievementStrategy: RequestStrategy<AchievementRequest> = {
  async accept(interaction, data) {
    if (!interaction.guild) return getString("errors", "noGuild");

    const params: AchievementParam = {
      achievement: data.achievement,
      guild_id: interaction.guild.id,
      type: "user_id",
      user_id: data.member.id,
    };

    const res = await Requests.giveAchievement(params);

    if (res.status === 409) {
      return getString("achievements", "alreadyHas", {
        username: data.member.displayName,
        achievement: data.achievement,
      });
    }

    if (res.error) return getString("errors", "internalError");

    invalidateUserCache(interaction.guild.id, data.member.id);

    return [
      getString("achievements", "approved", {
        achievement: data.achievement,
      }),
      getString("achievements", "granted", {
        achievement: data.achievement,
        username: data.member.displayName,
      }),
    ];
  },
  denyMessage(data) {
    return getString("achievements", "denied", {
      username: data.member.displayName,
      achievement: data.achievement,
    });
  },
  label(data) {
    return `Achievement: ${data.achievement} — ${data.member.displayName}`;
  },
};
