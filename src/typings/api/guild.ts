import type { GuildRecord, RecordTeam } from "./time";

export type Guild = {
  guild_id: string;
  multiplier: number;
  pb_channel_id: string | undefined;
  mod_channel_id: string | undefined;
  position_count: number;
};

export type CategoryUpdate = {
  message_id: string;
  category: string;
};

export type PbUpdate = {
  channel_id: string;
  category_messages: CategoryUpdate[];
};

export type GuildUpdate = {
  multiplier?: number;
  mod_channel_id?: string;
  pb_update?: PbUpdate;
  position_count?: number;
};

export type Boss = {
  name: string;
  display_name: string;
  category: string;
  solo: boolean;
  value_type: string;
};

export type Category = {
  thumbnail: string;
  order: number;
  name: string;
};

export type GuildBoss = {
  boss: string;
  category: string;
  guild_id: string;
};

export type GuildCategory = {
  guild_id: string;
  category: string;
  message_id: string | undefined;
};

export type DetailedGuild = {
  guild_id: string;
  pb_channel_id: string | undefined;
  position_count: number;
  bosses: Boss[];
  categories: Category[];
  guild_bosses: GuildBoss[];
  guild_categories: GuildCategory[];
  records: GuildRecord[] | undefined;
  teammates: RecordTeam[] | undefined;
};
