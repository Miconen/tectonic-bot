import prisma from "./client.js";
import {userExists} from "./getUser.js";

async function main(guild_id: string, user_id: string) {
    // Return false if we didn't update
    if (await userExists(guild_id, user_id)) return false;

    // Create new user
    await prisma.users.create({data: {guild_id, user_id}});

    // Return true if updated
    return true;
}

export {main as default};
