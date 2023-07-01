import {
    BaseInteraction,
    GuildMember, RoleResolvable
} from "discord.js";
import { getRole } from "./getRole.js";

const addRole = async (
    interaction: BaseInteraction,
    target: GuildMember,
    roleName: string
) => {
    let role = getRole(interaction, roleName);
    if (role == undefined)
        return;
    await target.roles.add(role as RoleResolvable);
};

export { addRole };