import * as User from "@requests/user";
import * as Guild from "@requests/guild";
import * as Time from "@requests/time";
import * as Event from "@requests/event";
import * as Points from "@requests/points";
import * as Leaderboard from "@requests/leaderboard";
import * as Misc from "@requests/misc";
import * as Wom from "@requests/wom";
import * as Teams from "@requests/teams";
import * as Achievement from "@requests/achievement";
import * as CombatAchievement from "@requests/combatAchievement";
import * as GuildRank from "@requests/guildRank";
import { HTTPError } from "discord.js";
import type {
  TectonicError,
  RFC7807Error,
  ApiResponse,
} from "@typings/api/errors";
import { getChildLogger } from "@logging/context";

const API_URL = process.env.API_URL
  ? `https://${process.env.API_URL}/api/v1/`
  : "http://localhost:8080/api/v1/";
const AUTH_KEY = process.env.AUTH_KEY ?? "";

if (!AUTH_KEY) {
  throw new Error("No AUTH_KEY found.");
}

function fail<T>(status: number, message: string, code = -1): ApiResponse<T> {
  return { error: true, status, code, message };
}

function normalizeError(data: unknown): TectonicError {
  const body = data as TectonicError | RFC7807Error;
  if ("title" in body) {
    return {
      code: -1,
      message: body.errors?.map((e) => e.message).join(", ") ?? body.detail,
    };
  }
  return body;
}

export async function fetchData<T>(
  endpoint: string,
  options: RequestInit = {},
  url: string = API_URL
): Promise<ApiResponse<T>> {
  const logger = getChildLogger({});
  const fullUrl = url + endpoint;
  const method = options.method ?? "GET";

  logger.info({ endpoint: fullUrl, method, body: options.body }, "API request");

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: AUTH_KEY,
        ...options.headers,
      },
    });

    // 204 No Content — success with no body
    if (response.status === 204) {
      logger.info({ status: 204 }, "API success (no content)");
      return { error: false, status: 204, data: undefined as unknown as T };
    }

    const contentType = response.headers.get("Content-Type");
    const isJson =
      contentType?.includes("application/json") ||
      contentType?.includes("application/openapi+json") ||
      contentType?.includes("application/problem+json");

    if (!isJson) {
      return fail(response.status, `Unsupported Content-Type "${contentType}"`);
    }

    const data = await response.json().catch(() => null);
    if (data === null) {
      return fail(response.status, "Failed to parse JSON response");
    }

    if (!response.ok) {
      const err = normalizeError(data);
      logger.error({ status: response.status, ...err }, "API error");
      return { error: true, status: response.status, ...err };
    }

    logger.info({ status: response.status }, "API success");
    return { error: false, status: response.status, data: data as T };
  } catch (e) {
    const status = e instanceof HTTPError ? e.status : 500;
    const message = e instanceof Error ? e.message : "Unknown network error";
    logger.error({ status, message }, "API network error");
    return fail(status, message);
  }
}

export const Requests = {
  ...User,
  ...Guild,
  ...Time,
  ...Event,
  ...Points,
  ...Leaderboard,
  ...Misc,
  ...Wom,
  ...Teams,
  ...Achievement,
  ...CombatAchievement,
  ...GuildRank,
};
