import { Requests } from "@requests/main";
import type { DetailedUser } from "@typings/api/user";
import type { AutocompleteInteraction } from "discord.js";
import { TTLCache } from "@utils/ttlCache";
import { getLogger } from "@logging/context";

const userCache = new TTLCache<DetailedUser>();
const teamCache = new TTLCache<string[]>();

export async function fetchUser(
  guildId: string,
  userId: string
): Promise<DetailedUser | undefined> {
  const logger = getLogger();
  const cacheKey = `${guildId}-${userId}`;

  if (userCache.has(cacheKey)) {
    logger.debug(`Hit autocomplete cache for user ${userId}`);
    return userCache.get(cacheKey);
  }

  try {
    const response = await Requests.getUser(guildId, {
      type: "user_id",
      user_id: userId,
    });

    if (response.error || !response.data) {
      logger.warn(
        {
          err: response.error,
        },
        `Failed to fetch user ${userId}`
      );
      return undefined;
    }

    userCache.set(cacheKey, response.data);
    return response.data;
  } catch (error) {
    logger.error({ err: error }, `Error fetching user ${userId}`);
    return undefined;
  }
}

export async function fetchTeams(
  competitionId: number
): Promise<string[] | undefined> {
  const logger = getLogger();
  const cacheKey = competitionId.toString();

  if (teamCache.has(cacheKey)) {
    logger.debug(
      `Hit team autocomplete cache for competition ${competitionId}`
    );
    return teamCache.get(cacheKey);
  }

  try {
    const response = await Requests.getCompetitionTeams(competitionId);

    if (response.error || !response.data) {
      logger.warn(
        {
          err: response.error,
        },
        `Failed to fetch teams for competition ${competitionId}`
      );
      return undefined;
    }

    teamCache.set(cacheKey, response.data);
    return response.data;
  } catch (error) {
    logger.error(
      {
        err: error,
      },
      `Error fetching teams for competition ${competitionId}`
    );
    return undefined;
  }
}

// Cache invalidation function for when user data changes
export function invalidateUserCache(guildId: string, userId: string): void {
  const logger = getLogger();
  const cacheKey = `${guildId}-${userId}`;
  userCache.delete(cacheKey);
  logger.debug(`Invalidated user cache for ${userId} in guild ${guildId}`);
}

// Helper function to safely respond to autocomplete interactions
export async function safeRespond(
  interaction: AutocompleteInteraction,
  options: { name: string; value: string }[]
): Promise<void> {
  const logger = getLogger();
  try {
    await interaction.respond(options.slice(0, 25));
  } catch (error) {
    logger.error(
      {
        err: error,
      },
      "Error responding to autocomplete interaction:"
    );
  }
}
