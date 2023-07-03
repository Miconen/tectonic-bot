import { CommandInteraction } from "discord.js"
import addTime from "./addTime.js"
import TimeConverter from "./TimeConverter.js"
import updateEmbed from "./updateEmbed.js"
import updatePb from "./updatePb.js"

async function submitHandler(
    boss: string,
    time: string,
    team: (string | undefined)[],
    interaction: CommandInteraction
) {
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
    const addedTime = await addTime(ticks, boss, team, guildId)
    if (!addedTime) {
        console.log("↳ Failed adding time")
        return "Failed adding time"
    }
    console.log("↳ Time added")

    // Update pb
    const updated = await updatePb(
        addedTime.time,
        addedTime.run_id,
        boss,
        guildId
    )
    if (!updated) {
        console.log("↳ Not a new pb")
        return `Time submitted, not a new pb :)`
    }

    // Pb updated
    await updateEmbed(boss, guildId, interaction)
    console.log(`↳ New pb: ${time} (${TimeConverter.timeToTicks(time)} ticks)`)
    return `New pb: ${time} (${TimeConverter.timeToTicks(time)} ticks)`
}

export default submitHandler
