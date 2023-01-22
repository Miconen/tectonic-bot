import prisma from "./client.js";

async function main(guildId: string, userId: string) {
	return await prisma.users.findFirst({where: {guild_id: guildId, user_id: userId}});
}

async function getPoints(guildId: string, userId: string) {
	let response = await main(guildId, userId);
	return response?.points;
}

async function userExists(guildId: string, userId: string) {
	let exists = await main(guildId, userId);
	return !!(exists?.user_id);
}

export { main as default, getPoints, userExists };