import { GuildMember } from "discord.js";

function teamsize(team: (string | undefined)[]) {
    return team.filter(player => player).length;
}

export default teamsize;
