import {
    CommandInteraction,
    GuildMember, RoleResolvable
} from "discord.js";
import { getRole } from "./getRole";

const addRole = async (
    interaction: CommandInteraction,
    target: GuildMember,
    roleName: string
) => {
    let role = getRole(interaction, roleName);
    if (role == undefined)
        return;
    await target.roles.add(role as RoleResolvable);
};

export { addRole };