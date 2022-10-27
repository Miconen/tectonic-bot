import {
    CommandInteraction,
    GuildMember,
    Role,
    RoleResolvable,
} from "discord.js";
import { roleIds, roleValues } from "./roleData.js";

const rankUp = (oldPoints: number, newPoints: number) => {
    let result: boolean | string = false;
    for (let [key, value] of roleValues.entries()) {
        if (oldPoints < key && newPoints >= key) result = value;
    }
    return result;
};

const rankDown = (oldPoints: number, newPoints: number) => {
    let result: boolean | string = false;
    // Janky way to get "lower" rank without using indexes
    let loopPreviousValue = "";
    for (let [key, value] of roleValues.entries()) {
        if (oldPoints >= key && newPoints < key) {
            result = loopPreviousValue;
            break;
        }
        loopPreviousValue = value;
    }
    return result;
};

const rankUpHandler = async (
    interaction: CommandInteraction,
    target: GuildMember,
    oldPoints: number,
    newPoints: number,
) => {
    // Check if range between old and new points falls on a rankup
    // Handle rankUp and rankDown depending on if oldPoints is bigger or smaller than newPoints
    let newRank =
        oldPoints < newPoints
            ? rankUp(oldPoints, newPoints)
            : rankDown(oldPoints, newPoints);
    // If rankup line not between point values return
    if (!newRank) return;
    // Remove all old roles
    await removeAllRoles(interaction, target);
    // Add new role
    await addRole(interaction, target, newRank);
    return newRank;
};

const removeAllRoles = async (
    interaction: CommandInteraction,
    target: GuildMember,
) => {
    for (let [key, _] of roleIds.entries()) {
        await removeRole(interaction, target, key);
    }
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

const removeRole = async (
    interaction: CommandInteraction,
    target: GuildMember,
    roleName: string,
) => {
    let role = getRole(interaction, roleName);
    if (role == undefined) return;
    await target.roles.remove(role as RoleResolvable);
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
    let pointsToNext = 0;
    for (let [key, value] of roleValues.entries()) {
        if (points < key) {
            pointsToNext = key - points;
            break;
        }
    }
    return pointsToNext;
};

export {
    addRole,
    removeRole,
    removeAllRoles,
    rankUpHandler,
    getRankByPoints,
    pointsToNextRank,
};
