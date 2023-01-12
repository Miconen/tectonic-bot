import prisma from "./client.js";
import {userExists} from "./getUser.js";

async function main(guildId: string, userId: string) {
    // Return false if we didn't update
    if (await userExists(guildId, userId)) return false;

    // Create new user
    await prisma.users.create({data: {guild_id: guildId, user_id: userId}});

    // Return true if updated
    return true;
}

export {main as default};
