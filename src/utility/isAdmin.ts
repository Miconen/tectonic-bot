import { ButtonInteraction, CommandInteraction } from "discord.js";
import { GuardFunction } from "discordx";

function hasPermissions(input: number) {
    let bitfield = BigInt(input);
    return !!((bitfield & (1n << 40n)) >> 40n);
}

export const IsAdmin: GuardFunction<ButtonInteraction | CommandInteraction> = async (arg, _, next) => {
    const argObj = arg instanceof Array ? arg[0] : arg;
    const permissions = argObj.member.permissions;

    console.log(permissions);
    console.log(hasPermissions(permissions));
    if (hasPermissions(permissions)) {
        await next();
    }
}

export default IsAdmin;
