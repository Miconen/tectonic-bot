import {CommandInteraction, GuildMember} from "discord.js";
import { getPoints } from '../../../database/getUser.js';
import * as rankUtils from "../../../utils/rankUtils/index.js";

const pointsHelper = async (user: GuildMember | null, interaction: CommandInteraction) => {
    let targetUser = user?.user?.id ?? interaction.user.id ?? "0";
    let targetUserName = user?.displayName ?? (interaction.member as GuildMember).displayName ?? "???";
    let points = await getPoints(interaction.guildId!, targetUser);

    let response: string;
    if (points || points === 0) {
        let nextRankUntil = rankUtils.pointsToNextRank(points);
        let nextRankIcon = rankUtils.rankIcon.get(rankUtils.getRankByPoints(points + nextRankUntil));

        response = `${rankUtils.rankIcon.get(rankUtils.getRankByPoints(points))} **${targetUserName}** has: ${points} points`;
        if (rankUtils.getRankByPoints(points) != "zenyte") response += `\n${nextRankIcon} Points to next level: ${nextRankUntil}`;
    }
    else {
        response = `❌ ${targetUserName} is not activated.`;
    }

    await interaction.reply(response);
}

export default pointsHelper;
