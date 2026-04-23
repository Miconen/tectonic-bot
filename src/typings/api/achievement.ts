import type { UserById, UserByRsn } from "./user";

export type Achievement = {
  name: string;
  thumbnail: string;
  discord_icon: string;
  order: number;
};

export type AchievementParam = { achievement: string; guild_id: string } & (
  | UserById
  | UserByRsn
);

export type CombatAchievement = {
  name: string;
};

export type CombatAchievementEntry = CombatAchievement & {
  point_source: string;
  points: number;
  point_source_display_name: string;
};
