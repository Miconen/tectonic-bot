import prisma from "./client.js";
import getUser, {userExists} from "./getUser.js";

async function main(guildId: string, userId: string, incomingPoints: number) {
    if (!await userExists(guildId, userId)) return false;
    await prisma.users.updateMany({
        where: {guild_id: guildId, user_id: userId},
        data: {points: {increment: incomingPoints}}
    });
    let response = await getUser(guildId, userId);
    return response?.points;
}

export {main as default};