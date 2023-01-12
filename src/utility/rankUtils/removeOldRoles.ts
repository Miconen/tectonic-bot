import { GuildMember } from "discord.js";
import { roleValues } from "./rankData.js";

const removeOldRoles = async (target: GuildMember) => {
    const oldRoles = target.roles.cache.filter(role => roleValues.has(Number(role.id)));
    if (oldRoles.size === 0)
        return;
    await target.roles.remove(oldRoles);
};

export { removeOldRoles };