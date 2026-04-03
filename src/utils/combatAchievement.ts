import { Requests } from "@requests/main";
import type { CombatAchievementEntry } from "@typings/requests";
import { TTLCache } from "@utils/ttlCache";
import { getLogger } from "@logging/context";

const caCache = new TTLCache<CombatAchievementEntry[]>();

export async function getGuildCAs(
  guild_id: string
): Promise<CombatAchievementEntry[] | undefined> {
  const logger = getLogger();

  if (caCache.has(guild_id)) {
    logger.debug("CA cache hit");
    return caCache.get(guild_id);
  }

  const res = await Requests.getGuildCombatAchievements(guild_id);
  if (res.error) return undefined;

  caCache.set(guild_id, res.data);
  return res.data;
}
