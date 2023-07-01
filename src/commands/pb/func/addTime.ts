import prisma from "../../../database/client.js";
import hasDuplicates from "./hasDuplicates.js";

async function addTime(ticks: number, boss: string, team: (string | undefined)[], guildId: string) {
    if (team.filter(player => player).length == 0) return;
    if (hasDuplicates(team)) return;

    const newTime = await prisma.times.create({
        data: {
            time: ticks,
            boss_name: boss,
        },
    });

    const timeId = newTime.run_id;

    let teamData = [];
    for (let player of team) {
        if (!player) continue;
        teamData.push({ run_id: timeId, user_id: player, guild_id: guildId });
    };

    const createdTeams = await prisma.teams.createMany({
        data: teamData,
    })

    return { ...newTime, run_id: timeId, team_size: createdTeams, team: teamData };
}

export default addTime;
