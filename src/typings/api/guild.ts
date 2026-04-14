export type Guild = {
  guild_id: string;
  multiplier: number;
  pb_channel_id: string | undefined;
  mod_channel_id: string | undefined;
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
};

export type Boss = {
  name: string;
  display_name: string;
  category: string;
  solo: boolean;
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
  pb_id: number | undefined;
};

export type GuildCategory = {
  guild_id: string;
  category: string;
  message_id: string | undefined;
};

export type DetailedGuild = {
  guild_id: string;
  pb_channel_id: string | undefined;
  bosses: Boss[];
  categories: Category[];
  guild_bosses: GuildBoss[];
  guild_categories: GuildCategory[];
  pbs: import("./time").Time[] | undefined;
  teammates: import("./time").Team[] | undefined;
};
