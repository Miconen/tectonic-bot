import {
    CommandInteraction,
    GuildMember,
} from "discord.js";
import { rankUpdater } from './rankUpdater';
import { removeOldRoles } from "./removeOldRoles";
import { addRole } from "./addRole";

interface IRankData { interaction: CommandInteraction; target: GuildMember; oldPoints: number; newPoints: number; }

const rankUpHandler = async (
    { interaction, target, oldPoints, newPoints }: IRankData,
) => {
    // Determine if user received a new rank
    let newRank = rankUpdater(oldPoints, newPoints);
    // If no new rank then return
    if (!newRank) return;
    // Remove old roles before adding new one
    await removeOldRoles(target);
    await addRole(interaction, target, newRank);
    return newRank;
};

export { rankUpHandler };