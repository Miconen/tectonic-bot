import type IDatabase from "../../../database/IDatabase"

import { container } from "tsyringe"

const DEFAULT_MAX_TIME = 9999999

function isFaster(time: number, oldTime?: number) {
    return (oldTime ?? DEFAULT_MAX_TIME) > time
}

async function updatePb(
    time: number,
    timeId: number,
    boss: string,
    guildId: string
) {
    const database = container.resolve<IDatabase>("Database")

    const oldBoss = await database.getOldPb(guildId, boss)
    if (!oldBoss) return false
    const oldTime = oldBoss.times?.time

    if (!isFaster(time, oldTime)) return false

    await database.updatePb(guildId, boss, timeId)
    return true
}

export default updatePb
