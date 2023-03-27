import prisma from "./client.js";
import getUser, {userExists} from "./getUser.js";

async function main(guild_id: string, user_id: string, incomingPoints: number) {
    if (!await userExists(guild_id, user_id)) return false;
    await prisma.users.update({
        where: { ids: {guild_id, user_id}},
        data: {points: {increment: incomingPoints}}
    });
    let response = await getUser(guild_id, user_id);
    return response?.points;
}

export {main as default};