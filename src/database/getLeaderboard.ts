// const QUERY = `SELECT rsn, points, type
//                FROM rsn
//                         INNER JOIN users ON users.id = rsn.user AND users.guild_id = ?
//                ORDER BY points DESC
//                LIMIT 50`;

import prisma from "./client.js";

async function main(guildId: string) {
    return await prisma.users.findMany({take: 50, orderBy: [{points: 'desc'}], where: {guild_id: guildId}});
}

export {main as default};