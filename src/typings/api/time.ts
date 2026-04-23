import type { User } from "./user";

export type NewTime = {
  user_ids: string[];
  time: number;
  boss_name: string;
};

export type TimeResponse = {
  boss_name: string;
  time: number;
  time_old: number;
  run_id: number;
};

export type DetailedTime = {
  time: number;
  boss_name: string;
  display_name: string;
  category: string;
  run_id: number;
  date: string;
  solo: boolean;
  team: User[];
};

export type Time = {
  time: number;
  boss_name: string;
  run_id: number;
  date: string;
  guild_id: string;
};

export type Team = {
  run_id: number;
  user_id: string;
  guild_id: string;
};
