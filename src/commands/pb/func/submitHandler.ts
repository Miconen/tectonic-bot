import type { CommandInteraction } from "discord.js"
import type IPointService from "@utils/pointUtils/IPointService"
import { Requests } from "@requests/main.js"

import TimeConverter from "./TimeConverter.js"
//import updateEmbed from "./updateEmbed.js"
import { container } from "tsyringe"

async function submitHandler(
    boss: string,
    time: string,
    team: string[],
    interaction: CommandInteraction
) {
    const pointService = container.resolve<IPointService>("PointService")
    console.log(`Submitting pb: ${boss} ${time}`)
    if (!interaction.guild) {
        console.log("↳ Failed getting guild")
        return "Failed getting guild"
    }
    const guildId = interaction.guild.id

    // Parse time
    const ticks = TimeConverter.timeToTicks(time)
    if (!ticks) {
        console.log("↳ Failed parsing ticks from time")
        return "Failed parsing ticks from time"
    }

    // Add time
    const res = await Requests.newTime(guildId, { user_ids: team, time: ticks, boss_name: boss })
    if (res.error) {
        console.log("↳ Failed adding time", res.message)
        return "Failed adding time"
    }

    console.log("↳ Time added")

    if (res.status == 200) {
        console.log("↳ Not a new pb")
        return `Time submitted, not a new pb :)`
    }

    // Pb updated
    await updateEmbed(boss, guildId, interaction)
    console.log(`↳ New pb: ${TimeConverter.ticksToTime(res.data.time)} (${res.data.time} ticks)\nBeating the old time ${TimeConverter.ticksToTime(res.data.time_old)} (${res.data.time_old} ticks)`)

    // Fetch and map user ids to GuildMember types
    let members = await interaction.guild.members.fetch({ user: team })
    let pointsResponses = []
    if (members) {
        // Give points
        // TODO: Use new API endpoints instead of hard coding points
        let PB_POINTS = 10
        pointsResponses = await pointService.givePointsToMultiple(
            PB_POINTS,
            members,
            interaction
        )
    } else {
        pointsResponses.push("Error fetching users to give points to")
    }

    // Construct response
    let response = `# New pb: ${time} (${TimeConverter.timeToTicks(
        time
    )} ticks)\n`
    response += pointsResponses.join("\n")

    return response
}

export default submitHandler
