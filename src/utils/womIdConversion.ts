import IDatabase from "../database/IDatabase";
import { container } from "tsyringe"

const database = container.resolve<IDatabase>("Database")

/**
 * Returns a map that reprecents the wom ids associated with the particular discord user
 * @key Wise Old Man ID 
 * @value Discord ID 
 */
export async function womToDiscord(guildId: string, womIds: string[]) {
    let rsns = await database.getUsersByWomIds(guildId, womIds)
    const userIdMap = new Map<string, string>;

    rsns.forEach(user => {
        userIdMap.set(user.wom_id, user.user_id);
    })

    return userIdMap;
}
