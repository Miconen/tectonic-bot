import TimeConverter from "../../commands/pb/func/TimeConverter.js"
import IUserService from "./IUserService.js"
import { inject, injectable, singleton } from "tsyringe"
import IDatabase from "../../database/IDatabase.js"

@singleton()
@injectable()
export class UserService implements IUserService {
    constructor(@inject("Database") private database: IDatabase) {}

    public async getAccounts(userId: string, guildId: string) {
        const accounts = await this.database.getRsns(guildId, userId);
        return accounts.map((account) => account.rsn)
    }

    public async getPbs(userId: string, guildId: string) {
        const times = await this.database.getUsersPbs(guildId, userId)
        let timesFormatted = times.map((time) => ({
            time: TimeConverter.ticksToTime(time.time),
            boss: `${time.guild_bosses[0].bosses.category} | ${time.guild_bosses[0].bosses.display_name}`,
        }))

        return timesFormatted
    }
}
