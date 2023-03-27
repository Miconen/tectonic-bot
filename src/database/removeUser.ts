import prisma from "./client.js";

async function main(guild_id: string, user_id: string) {

	let response = await prisma.users.deleteMany({where: {guild_id, user_id}});

	return !!response.count;
}

export {main as default}