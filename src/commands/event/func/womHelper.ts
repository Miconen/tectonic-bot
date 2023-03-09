import type { Snowflake } from "discord.js";
import { CommandInteraction, BaseInteraction } from "discord.js";
import { WOMClient, CompetitionStatus, ParticipationWithPlayerAndProgress } from "@wise-old-man/utils";
import * as pointUtils from "../../../utility/pointUtils/index.js"
import * as idConverter from "../../../utility/idConversion/index.js"

const client = new WOMClient();

async function womHelper(competitionId: number, interaction: CommandInteraction, cutoff: number) {
    const competition = await client.competitions.getCompetitionDetails(competitionId);

    // if (competition.endsAt.setHours(0, 0, 0, 0,) <= new Date().setHours(0, 0, 0, 0)) return "hahaxd";
    let response = "";
    let pointValues = [20,15,10,5];
    let userWomIds: number[] = [];
    
    for (const [i, player] of competition.participations.entries()) {
        if (player.progress.gained < cutoff) continue;

        // Test print
        response += `${player.player.displayName} ${(player.progress.gained/1000000).toFixed(3)}m\n`;
 
        let points = pointValues[Math.min(i,4)];

        userWomIds.push(player.player.id);
    };

    let userDiscordIds: Snowflake[] = idConverter.womToDiscord(userWomIds);
    let users = interaction.guild?.members.fetch({ user: userDiscordIds });

    interaction.reply(response);
}

export default womHelper;