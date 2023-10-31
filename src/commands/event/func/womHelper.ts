import type { Snowflake } from "discord.js";
import type IPointService from "../../../utils/pointUtils/IPointService"
import { CommandInteraction } from "discord.js";
import { WOMClient, CompetitionStatus, ParticipationWithPlayerAndProgress } from "@wise-old-man/utils";
import { replyHandler } from "../../../utils/replyHandler.js";
import * as idConverter from "../../../utility/idConversion/index.js"

import { container } from "tsyringe"

const wom = new WOMClient();

async function womHelper(competitionId: number, interaction: CommandInteraction, cutoff: number) {
    const pointService = container.resolve<IPointService>("PointService")

    const competition = await wom.competitions.getCompetitionDetails(competitionId);

    // if (competition.endsAt.setHours(0, 0, 0, 0,) <= new Date().setHours(0, 0, 0, 0)) return "hahaxd";
    let response = "";
    let pointValues = [20,15,10,5];
    let userWomIds: number[] = [];

    response += "## Title: " + competition.title + "\n";
    response += "Participants: " + competition.participantCount + "\n";
    
    let participantCountAboveCutoff = 0;
    let participants = "";
    for (const [i, player] of competition.participations.entries()) {
        if (player.progress.gained < cutoff) continue;

        // Test print
        // response += `${player.player.displayName} ${(player.progress.gained/1000000).toFixed(3)}m\n`;
        participants += `**${player.player.displayName}** - ${player.progress.gained}\n`;
        ++participantCountAboveCutoff
 
        let points = pointValues[Math.min(i,4)];

        userWomIds.push(player.player.id);
    };

    response += `Participants above cutoff (${cutoff}): ${participantCountAboveCutoff}\n\n`;
    response += participants;

    let userDiscordIds: Snowflake[] = idConverter.womToDiscord(userWomIds);
    let users = interaction.guild?.members.fetch({ user: userDiscordIds });

    await replyHandler(response, interaction);
}

export default womHelper;
