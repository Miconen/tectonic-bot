import { Requests } from "@requests/main.js"

/**
 * Returns a map that reprecents the wom ids associated with the particular discord user
 * @key Wise Old Man ID 
 * @value Discord ID 
 */
export async function womToDiscord(guildId: string, womIds: string[]) {
    let users = Requests.getUsers(guildId, { type: "wom", wom: womIds })

    const userIdMap = new Map<string, string>;

    for (let user of users) {
        let rsn = user.rsns.find((rsn) => {
            return womIds.includes(rsn.rsn);
        })

        if (!rsn) continue;

        userIdMap.set(rsn.wom_id, user.user_id);
    }

    return userIdMap;
}
