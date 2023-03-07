import {
    BaseInteraction,
    GuildMember,
} from "discord.js";
import { rankUpdater } from './rankUpdater.js';
import { removeOldRoles } from "./removeOldRoles.js";
import { addRole } from "./addRole.js";

type RankData = { interaction: BaseInteraction; target: GuildMember; oldPoints: number; newPoints: number; }

const rankUpHandler = async (
    { interaction, target, oldPoints, newPoints }: RankData,
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