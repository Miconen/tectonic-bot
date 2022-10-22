// const QUERY = `SELECT rsn, points, type
//                FROM rsn
//                         INNER JOIN users ON users.id = rsn.user AND users.guild_id = ?
//                ORDER BY points DESC
//                LIMIT 50`;

import prisma from "./client.js";

async function main(guildId: string, userId: string) {
    let response = await prisma.users.findMany({distinct: ["guild_id", "user_id"], orderBy: {points: "desc"}});
    console.log(response);

    // let leaderboard: any[] = [];
    // res.forEach((row: any, index: number) => {
    //     // TODO: Use rsn instead of pinging the user
    //     leaderboard.push({
    //         name: `**${row.rsn}** ${ironmanIcon.get(row.type)}`,
    //         value: `${row.points} points.`,
    //     });
    // });
    //
    // return leaderboard;
}

export {main as default};