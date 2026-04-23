import type { SimpleUser } from "./user";

export type PointsResponse = SimpleUser & {
  given_points: number;
};

export type CustomPoints = {
  type: "custom";
  amount: number;
};

export type PresetPoints = {
  type: "preset";
  event:
    | "event_participation"
    | "event_hosting"
    | "clan_pb"
    | "split_low"
    | "split_medium"
    | "split_high"
    | "combat_achievement_low"
    | "combat_achievement_medium"
    | "combat_achievement_high"
    | "combat_achievement_very_high"
    | "combat_achievement_very_highest";
};

export type Points = CustomPoints | PresetPoints;

export type PointsParam = {
  user_id: string | string[];
  points: Points;
};

export type GuildPointSource = {
  source: string;
  points: number;
  name: string;
};
