import prisma from "./client.js";

async function main(guild_id: string) {
	let response = await prisma.guilds.findUnique({where: {guild_id}})
	return response?.multiplier;
}

export { main as default }