import TimeConverter from "../../commands/pb/func/TimeConverter.js"
import IUserService from "./IUserService.js"
import { singleton } from "tsyringe"

@singleton()
export class UserService implements IUserService {
    public async getAccounts(userId: string, guildId: string) {
        const accounts = Requests.getUserRsns(guildId, { type: "user_id", user_id: userId })
        return accounts.map((account) => account.rsn)
    }

    public async getPbs(userId: string, guildId: string) {
        const times = Requests.getUserPbs(guildId, { type: "user_id", user_id: userId })
        let timesFormatted = times.map((time) => ({
            time: TimeConverter.ticksToTime(time.time),
            boss: `${time.boss_category} | ${time.boss_name}`,
        }))

        return timesFormatted
    }
}
