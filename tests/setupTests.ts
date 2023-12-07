import "reflect-metadata"

import { container } from "tsyringe"
import { MockDatabase } from "../src/database/MockDatabase";
import { MockRankService } from "../src/utils/rankUtils/MockRankService";
import { MockPointService } from "../src/utils/pointUtils/MockPointService";
import { MockUserService } from "../src/utils/userUtils/MockUserService";

beforeAll(() => {
    container.registerSingleton("Database", MockDatabase)
    container.registerSingleton("RankService", MockRankService)
    container.registerSingleton("PointService", MockPointService)
    container.registerSingleton("UserService", MockUserService)
});

afterAll(() => {
    container.dispose()
});
