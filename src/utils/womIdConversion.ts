import { Requests } from "@requests/main.js"

/**
 * Returns a map that reprecents the wom ids associated with the particular discord user
 * @key Wise Old Man ID 
 * @value Discord ID 
 */
export async function womToDiscord(guildId: string, womIds: string[]) {
    let users = await Requests.getUsers(guildId, { type: "wom", wom: womIds })

    const userIdMap = new Map<string, string>;

    if (users.error) return userIdMap

    for (let user of users.data) {
        let rsn = user.rsns.find((rsn) => {
            return womIds.includes(rsn.rsn);
        })

        if (!rsn) continue;

        userIdMap.set(rsn.wom_id, user.user_id);
    }

    return userIdMap;
}
