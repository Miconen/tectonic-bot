import prisma from "./client.js";

async function main(guild_id: string, multiplier: number) {
    let response = await prisma.guilds.upsert({
        where: {guild_id},
        update: {multiplier},
        create: {guild_id, multiplier}
    });
    return response.multiplier;
}

export {main as default}