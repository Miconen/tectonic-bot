import IDatabase from "@database/IDatabase";
import IUserService from "@utils/userUtils/IUserService";
import { inject, injectable, singleton } from "tsyringe";

@singleton()
@injectable()
export class MockUserService implements IUserService {
    constructor(@inject("Database") private database: IDatabase) {}

    public async getAccounts(userId: string, guildId: string) {
        return ["Foo", "Bar"]
    }

    public async getPbs(userId: string, guildId: string) {
        let time1 = { time: "123", boss: "Foo" };
        let time2 = { time: "321", boss: "Bar" };
        return [time1, time2];
    }
}
