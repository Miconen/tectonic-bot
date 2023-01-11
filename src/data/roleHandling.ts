import {
    CommandInteraction,
    GuildMember,
    Role,
    RoleResolvable,
} from "discord.js";
import { roleIds, roleValues } from "./roleData.js";

const rankUp = (oldPoints: number, newPoints: number) => {
    const newRank = [...roleValues.entries()].find(([minPoints, role]) => oldPoints <= minPoints && newPoints > minPoints);
    return newRank ? newRank[1] : false;
};

const rankDown = (oldPoints: number, newPoints: number) => {
    let newRole: boolean | string = false;
    for (let [minPoints, role] of [...roleValues.entries()].reverse()) {
        if (oldPoints >= minPoints && newPoints < minPoints) {
            newRole = role;
            break;
        }
    }
    return newRole;
};

const rankUpHandler = async (
    interaction: CommandInteraction,
    target: GuildMember,
    oldPoints: number,
    newPoints: number,
) => {
    // Check if range between old and new points falls on a rankup
    // Handle rankUp and rankDown depending on if oldPoints is bigger or smaller than newPoints
    let newRank = (oldPoints < newPoints) ? rankUp(oldPoints, newPoints) : rankDown(oldPoints, newPoints);
    // If rankup line not between point values return
    if (!newRank) return;
    // Remove all old roles
    await removeOldRoles(target);
    // Add new role
    await addRole(interaction, target, newRank);
    return newRank;
};

const removeOldRoles = async (target: GuildMember) => {
    const oldRoles = target.roles.cache.filter(role => roleValues.has(Number(role.id)));
    if (oldRoles.size === 0) return;
    await target.roles.remove(oldRoles);
};

const removeAllRoles = async (
    interaction: CommandInteraction,
    target: GuildMember,
) => {
    // Remove all roles
    await target.roles.remove(Object.values(roleIds));
};

const addRole = async (
    interaction: CommandInteraction,
    target: GuildMember,
    roleName: string,
) => {
    let role = getRole(interaction, roleName);
    if (role == undefined) return;
    await target.roles.add(role as RoleResolvable);
};

const getRole = (
    interaction: CommandInteraction,
    roleName: string,
): Role | undefined => {
    let guild = interaction.guild;
    if (guild?.id != "979445890064470036") return undefined;
    let roleId = roleIds.get(roleName) ?? "0";
    return guild?.roles.cache.get(roleId);
};

const getRankByPoints = (points: number) => {
    let rank = "jade";
    for (let [key, value] of roleValues.entries()) {
        if (points < key) break;
        rank = value;
    }
    return rank;
};

const pointsToNextRank = (points: number) => {
    const nextRank = [...roleValues.entries()].find(([minPoints]) => minPoints > points);
    return nextRank ? nextRank[0] - points : -1;
};


export {
    addRole,
    removeAllRoles,
    removeOldRoles,
    rankUpHandler,
    getRankByPoints,
    pointsToNextRank,
};
