import hasDuplicates from "./hasDuplicates.js"
import type IDatabase from "@database/IDatabase"

import { container } from "tsyringe"

async function addTime(
    ticks: number,
    boss: string,
    team: (string | undefined)[],
    guildId: string
) {
    const database = container.resolve<IDatabase>("Database")

    if (team.filter((player) => player).length == 0) return
    if (hasDuplicates(team)) return

    const newTime = await database.addTime(ticks, boss)
    const timeId = newTime.run_id

    let teamData = []
    for (let player of team) {
        if (!player) continue
        teamData.push({ run_id: timeId, user_id: player, guild_id: guildId })
    }

    await database.addTeam(teamData)

    return {
        ...newTime,
        run_id: timeId,
        team: teamData,
    }
}

export default addTime
