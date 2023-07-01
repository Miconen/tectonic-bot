import { BaseInteraction, Role } from "discord.js";
import { roleIds } from "./rankData.js";


const getRole = (
    interaction: BaseInteraction,
    roleName: string
): Role | undefined => {
    let guild = interaction.guild;
    if (!guild)
        return;
    if (guild.id != "979445890064470036")
        return undefined;
    let roleId = roleIds.get(roleName) ?? "0";
    return guild.roles.cache.get(roleId);
};

export { getRole };