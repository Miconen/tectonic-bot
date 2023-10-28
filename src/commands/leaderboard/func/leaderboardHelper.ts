import {CommandInteraction, EmbedBuilder} from "discord.js";
import { Pagination } from "@discordx/pagination";
import type IRankService from "../../../utils/rankUtils/IRankService"
import type IDatabase from "../../../database/IDatabase"

import { container } from "tsyringe"

const leaderboardHelper = async (interaction: CommandInteraction) => {
    const rankService = container.resolve<IRankService>("RankService")
    const database = container.resolve<IDatabase>("Database")

    if (!interaction.guildId) return;

    await interaction.deferReply();

    let users = await database.getLeaderboard(
        interaction.guildId,
    );
    let userIds = users.map(user => user.user_id);
    let usersData = await interaction.guild?.members.fetch({ user: userIds })
    if (!usersData) return;

    interface ILeaderboardUser {
        name: string;
        value: string;
    }

    let leaderboard: ILeaderboardUser[] = [];
    let serverRank = 0;
    for (let user of users) {
        let userData = usersData.get(user.user_id)
        if (!userData) continue;

        let rank = rankService.getRankByPoints(user.points);
        serverRank++;

        leaderboard.push({
            name: `#${serverRank} **${userData.displayName}**`,
            value: `${rankService.rankIcon.get(rank)} ${user.points} points`,
        });
    }

    let botIconUrl = interaction.client.user?.avatarURL() ?? '';

    const embedMaker = (): EmbedBuilder => {
        return new EmbedBuilder()
            .setTitle('Tectonic Leaderboard')
            .setAuthor({
                name: 'Tectonic Bot',
                url: 'https://github.com/Miconen/tectonic-bot',
                iconURL: botIconUrl,
            })
            .setColor('#0099ff')
            .setTimestamp();
    };

    let pages: any = [];
    const pageMaker = (i: number) => {
        let fields = leaderboard.slice(i, i + 10);

        return {
            embeds: [
                embedMaker()
                    .setFooter({
                        text: `Page ${i%9} (${i + 1}-${i + 10})`,
                    })
                    .addFields(
                        ...fields
                    ),
            ],
        };
    };
    for (let i = 0; i <= leaderboard.length; i++) {
        if (i % 10 == 0) pages.push(pageMaker(i));
    }

    await new Pagination(interaction, [...pages]).send();
}

export default leaderboardHelper;
