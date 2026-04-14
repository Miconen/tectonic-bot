import type { Achievement, CombatAchievement } from "./achievement";
import type { DetailedTime } from "./time";

export type RSN = {
  rsn: string;
  wom_id: string;
};

export type SimpleUser = {
  user_id: string;
  guild_id: string;
  points: number;
};

export type GuildEvent = {
  name: string;
  wom_id: string;
  guild_id: string;
  user_id: string;
  placement: number;
  position_cutoff: number;
  solo: boolean;
};

export type User = SimpleUser & {
  rsns: RSN[];
  events: GuildEvent[];
  achievements: Achievement[];
  combat_achievements: CombatAchievement[];
};

export type DetailedUser = User & { times: DetailedTime[] };

// Lookup param types

export type UserById = { type: "user_id"; user_id: string };
export type UserByWom = { type: "wom"; wom: string };
export type UserByRsn = { type: "rsn"; rsn: string };
export type UserParam = UserById | UserByWom | UserByRsn;

export type UsersById = { type: "user_id"; user_id: string[] };
export type UsersByWom = { type: "wom"; wom: string[] };
export type UsersByRsn = { type: "rsn"; rsn: string[] };
export type UsersParam = UsersById | UsersByWom | UsersByRsn;
