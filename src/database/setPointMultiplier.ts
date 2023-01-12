import prisma from "./client.js";

async function main(guildId: string, newMultiplier: number) {
    let response = await prisma.guilds.upsert({
        where: {guild_id: guildId},
        update: {multiplier: newMultiplier},
        create: {guild_id: guildId, multiplier: newMultiplier}
    });
    return response.multiplier;
}

export {main as default}