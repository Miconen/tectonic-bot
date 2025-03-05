import type IPointService from "@utils/pointUtils/IPointService"
import { CommandInteraction } from "discord.js";
import { WOMClient } from "@wise-old-man/utils";
import { replyHandler } from "@utils/replyHandler.js";
import { womToDiscord } from "@utils/womIdConversion.js";

import { container } from "tsyringe"

const wom = new WOMClient();

async function womHelper(competitionId: number, interaction: CommandInteraction, cutoff: number) {
    if (!interaction.guild) return;

    interaction.deferReply();

    const pointService = container.resolve<IPointService>("PointService")

    const competition = await wom.competitions.getCompetitionDetails(competitionId);

    const userWomIds: string[] = [];
    const extraPointValues = [15, 10, 5];
    const extraPoints: Record<string, number> = {};
    const pointReward = pointService.pointRewards.get("event_participation") ?? 0;

    // Calculate participants valid for points and construct participants string
    let participantCountAboveCutoff = 0;
    for (const [_, player] of competition.participations.entries()) {
        if (player.progress.gained < cutoff) continue;
        ++participantCountAboveCutoff
        userWomIds.push(player.player.id.toString());
    };

    let usersMap = await womToDiscord(interaction.guild.id, userWomIds);
    let discordUsers = await interaction.guild.members.fetch({ user: Array.from(usersMap.values()) });
    let foundUnlinkedAccounts = false;

    let linkedUsers = "";
    let nonLinkedUsers = "";
    let competitiors = 0;
    for (const [i, player] of competition.participations.entries()) {
        if (player.progress.gained > 1) ++competitiors;
        if (player.progress.gained < cutoff) continue;
        const bonus = extraPointValues[Math.min(i, 3)] ?? 0;
        const discordId = usersMap.get(player.player.id.toString()) ?? undefined;
        if (discordId) {
            extraPoints[discordId] = bonus;
        }
        else {
            let points = pointReward + bonus;
            nonLinkedUsers += `**${player.player.displayName}** +${points} points, when linked\n`;
            foundUnlinkedAccounts = true;
        }
    };

    const linkedUsersList = await pointService.givePointsToMultiple(pointReward, discordUsers, interaction, extraPoints);
    linkedUsers = linkedUsersList.join("\n");

    // Build the response string
    let response = "";
    response += `## ${competition.title}\n`;
    response += `Participants: ${competitiors}\n`;
    response += `Eligible for points: ${participantCountAboveCutoff}`;
    if (linkedUsers) {
        response += `\n## Points\n${linkedUsers}`;
    }
    if (foundUnlinkedAccounts) {
        response += `\n## Unlinked accounts\n${nonLinkedUsers}\n`;
        response += "_Once you link your rsn to the bot you'll be eligible to gain event points_\n";
        response += "_Please tag leadership to help with linking your account with your rsn_";
    }

    await replyHandler(response, interaction);
}

export default womHelper;
