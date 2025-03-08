import TimeConverter from "@commands/pb/func/TimeConverter.js"
import IUserService from "./IUserService.js"
import { singleton } from "tsyringe"
import { Requests } from "@requests/main.js"

@singleton()
export class UserService implements IUserService {
    public async getAccounts(userId: string, guildId: string) {
        const accounts = await Requests.getUser(guildId, { type: "user_id", user_id: userId })
        if (accounts.error) return []
        return accounts.data.rsns.map((account) => account.rsn)
    }

    public async getPbs(userId: string, guildId: string) {
        const times = await Requests.getUser(guildId, { type: "user_id", user_id: userId })
        if (times.error) return []
        let timesFormatted = times.data.times.map((time) => ({
            time: TimeConverter.ticksToTime(time.time),
            boss: `${time.category} | ${time.boss_name}`,
        }))

        return timesFormatted
    }
}
