import type { CommandInteraction } from "discord.js"
import type IPointService from "@utils/pointUtils/IPointService"

import TimeConverter from "./TimeConverter.js"
import updateEmbed from "./updateEmbed.js"
import { container } from "tsyringe"

async function submitHandler(
    boss: string,
    time: string,
    team: string[],
    interaction: CommandInteraction
) {
    const pointService = container.resolve<IPointService>("PointService")
    console.log(`Submitting pb: ${boss} ${time}`)
    // Parse guild id
    const guildId = interaction?.guildId
    if (!guildId) {
        console.log("↳ Failed getting guildId")
        return "Failed getting guild id"
    }

    // Parse time
    const ticks = TimeConverter.timeToTicks(time)
    if (!ticks) {
        console.log("↳ Failed parsing ticks from time")
        return "Failed parsing ticks from time"
    }

    // Add time
    const addedTime = Requests.newTime(guildId, { user_ids: team, time: ticks, boss_name: boss })
    if (!addedTime) {
        console.log("↳ Failed adding time")
        return "Failed adding time"
    }

    console.log("↳ Time added")

    // FIX: Check if old pb was beaten
    if (!addedTime) {
        console.log("↳ Not a new pb")
        return `Time submitted, not a new pb :)`
    }

    // Pb updated
    await updateEmbed(boss, guildId, interaction)
    console.log(`↳ New pb: ${time} (${TimeConverter.timeToTicks(time)} ticks)`)

    // Fetch and map user ids to GuildMember types
    let filteredTeam = team.filter((user): user is string => user !== undefined)
    let fetchedGuildMembers = await interaction.guild?.members.fetch({
        user: filteredTeam,
    })
    let pointsResponses = []
    if (fetchedGuildMembers) {
        // Give points
        let PB_POINTS = 10
        pointsResponses = await pointService.givePointsToMultiple(
            PB_POINTS,
            fetchedGuildMembers,
            interaction
        )
    } else {
        pointsResponses.push("Error fetching users to give points to")
    }

    // Construct resposne
    let response = `# New pb: ${time} (${TimeConverter.timeToTicks(
        time
    )} ticks)\n`
    response += pointsResponses.join("\n")

    return response
}

export default submitHandler
