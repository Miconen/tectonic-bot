import type { User } from "./user";

export type NewRecord = {
  user_ids: string[];
  value: number;
  boss_name: string;
};

export type RecordResponse = {
  boss_name: string;
  value: number;
  value_old: number;
  record_id: number;
  position: number | null;
};

export type DetailedRecord = {
  value: number;
  boss_name: string;
  display_name: string;
  category: string;
  record_id: number;
  date: string;
  solo: boolean;
  value_type: string;
  team: User[];
};

export type GuildRecord = {
  value: number;
  boss_name: string;
  record_id: number;
  date: string;
  guild_id: string;
  position: number;
};

export type RecordTeam = {
  record_id: number;
  user_id: string;
  guild_id: string;
};

// Legacy aliases for backward compatibility during migration
export type NewTime = NewRecord;
export type TimeResponse = RecordResponse;
export type DetailedTime = DetailedRecord;
export type Time = GuildRecord;
export type Team = RecordTeam;
