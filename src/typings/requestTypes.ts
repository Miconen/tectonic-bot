import type { GuildMember, Snowflake } from "discord.js";

export type RequestType = "split" | "ca" | "pb" | "achievement";

export type WithSource = {
  source: string;
  sourceName: string;
};

export type BaseRequest = {
  type: RequestType;
  channel: string;
  message: string;
  timestamp: number;
  screenshot: string;

  modMessage?: string;
  modChannel?: string;
};

export type SplitRequest = BaseRequest &
  WithSource & {
    type: "split";
    members: GuildMember[];
    points: number;
  };

export type CaRequest = BaseRequest &
  WithSource & {
    type: "ca";
    caName: string;
    guildId: string;
    members: GuildMember[];
    alreadyCompleted: string[];
    newCompleters: string[];
    points: number;
  };

export type PbRequest = BaseRequest &
  WithSource & {
    type: "pb";
    boss: string;
    bossTitle: string;
    time: string;
    team: string[];
    points: number;
  };

export type AchievementRequest = BaseRequest & {
  type: "achievement";
  member: GuildMember;
  achievement: string;
};

export type PendingRequest =
  | SplitRequest
  | CaRequest
  | PbRequest
  | AchievementRequest;

export type RequestCache = Map<Snowflake, PendingRequest>;
