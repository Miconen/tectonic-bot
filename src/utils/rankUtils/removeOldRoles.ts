import { GuildMember } from "discord.js";
import { roleIds } from "./rankData.js";

const removeOldRoles = async (target: GuildMember) => {
    const oldRoles = target.roles.cache.filter(role => getByValue(roleIds, role.id));
    if (oldRoles.size === 0)
        return;
    await target.roles.remove(oldRoles);
};

export { removeOldRoles };

// Get role id from the roleIds map using a value instead of a key
function getByValue(map: Map<string, string>, searchValue: string) {
    for (let [key, value] of map.entries()) {
        if (value === searchValue)
            return key;
    }
    return;
}