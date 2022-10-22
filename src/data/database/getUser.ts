import prisma from "./client.js";

async function main(guildId: string, userId: string) {
	let response = await prisma.users.findFirst({ where: { guild_id: guildId, user_id: userId } });
	return !!(response);
}

export { main as default };
