import { CommandInteraction, GuildMember, RoleResolvable } from "discord.js"
import { RoleIdMap, RoleValueMap } from "./RoleIdMap.js"

const rankUp = (oldPoints: number, newPoints: number) => {
    let result: boolean | string = false;
    for (let [key, value] of RoleValueMap.entries()) {
        if (oldPoints < key && newPoints >= key) result = value; 
    };
    return result;
}

const rankDown = (oldPoints: number, newPoints: number) => {
    let result: boolean | string = false;
    // Janky way to get "lower" rank without using indexes
    let loopPreviousValue = '';
    for (let [key, value] of RoleValueMap.entries()) {
        if (oldPoints >= key && newPoints < key) {
            result = loopPreviousValue;
            break;
        }
        loopPreviousValue = value;
    }
    return result;
}

const rankUpHandler = (interaction: CommandInteraction, target: GuildMember, oldPoints: number, newPoints: number) => {
    // Check if range between old and new points falls on a rankup
    // Handle rankUp and rankDown depending on if oldPoints is bigger or smaller than newPoints
    let newRank = (oldPoints < newPoints ? rankUp(oldPoints, newPoints) : rankDown(oldPoints, newPoints))
    // If rankup line not between point values return
    if (!newRank) return;
    // Remove all old roles
    removeAllRoles(interaction, target) 
    // Add new role
    addRole(interaction, target, newRank)
}

const removeAllRoles = async (interaction: CommandInteraction, target: GuildMember) => {
   for (let [key, value] of RoleIdMap.entries()) {
       removeRole(interaction, target, key); 
   } 
}

const addRole = async (interaction: CommandInteraction, target: GuildMember, roleName: string) => {
    let guild = interaction.guild
    let roleId = RoleIdMap.get(roleName) ?? '0';
    let role = guild?.roles.cache.get(roleId)
    await target.roles.add(role as RoleResolvable)
}

const removeRole = async (interaction: CommandInteraction, target: GuildMember, roleName: string) => {
    let guild = interaction.guild
    let roleId = RoleIdMap.get(roleName) ?? '0';
    let role = guild?.roles.cache.get(roleId)
    await target.roles.remove(role as RoleResolvable);
}

export { addRole, removeRole, removeAllRoles, rankUpHandler }