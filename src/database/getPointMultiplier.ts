import prisma from "./client.js";

async function main(guildId: string) {
	let response = await prisma.guilds.findFirst({where: {guild_id: guildId}})
	return response?.multiplier;
}

export { main as default }