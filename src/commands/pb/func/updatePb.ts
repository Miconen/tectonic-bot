import prisma from "../../../database/client.js";

const DEFAULT_MAX_TIME = 9999999;

function isFaster(time: number, oldTime?: number) {
    return (oldTime ?? DEFAULT_MAX_TIME) > time;
}

async function updatePb(time: number, timeId: number, boss: string, guildId: string) {
    const oldBoss = await prisma.guild_bosses.findUnique({
        where: {
            boss_guild_id: {
                boss: boss,
                guild_id: guildId,
            },
        },
        include: {
            times: true,
        }
    })

    if (!oldBoss) return false;
    const oldTime = oldBoss.times?.time;

    if (!isFaster(time, oldTime)) return false;

    console.log("Updating pb", oldBoss.boss);
    console.log("Old time", oldTime);
    console.log("New time", time);

    await prisma.guild_bosses.update({
        where: {
            boss_guild_id: {
                boss: boss,
                guild_id: guildId,
            }
        },
        data: {
            pb_id: timeId,
        }
    })

    return true;
}

export default updatePb;
