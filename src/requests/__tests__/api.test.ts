import { expect } from "chai";
import { describe, it } from "mocha";
import type {
	AchievementParam,
	ApiResponse,
	EventWinParam,
	GuildUpdate,
	NewTime,
	PointsParam,
	UserParam,
	UsersParam,
} from "@typings/requests";
import { Requests } from "@requests/main";

const guild = "test_guild";
const user = "test_user";
const rsn = { name: "Comfy hug", id: "39527" };
const competition = 77922;
const team_competition = 82737;

// Test data
const guild_update: GuildUpdate = {
	pb_channel: "test_channel",
	multiplier: 3,
	category_messages: [
		{ message_id: "1", category: "Miscellaneous" },
		{ message_id: "2", category: "Varlamore" },
	],
};

const new_time: NewTime = {
	user_ids: [user],
	time: 3000,
	boss_name: "vardorvis",
};

const event_wins: EventWinParam[] = [
	{ competition, type: "individual", top: 3 },
	{
		competition: team_competition,
		type: "team",
		team_names: ["Unlucky Charms"],
	},
];

const user_queries: UserParam[] = [
	{ type: "user_id", user_id: user },
	{ type: "wom", wom: rsn.id },
	{ type: "rsn", rsn: rsn.name },
];

const users_queries: UsersParam[] = [
	{ type: "user_id", user_id: [user] },
	{ type: "wom", wom: [rsn.id] },
	{ type: "rsn", rsn: [rsn.name] },
];

const point_queries: PointsParam[] = [
	{ user_id: user, points: { type: "custom", amount: 30 } },
	{ user_id: user, points: { type: "preset", event: "split_low" } },
];

const points_queries: PointsParam[] = [
	{ user_id: [user], points: { type: "custom", amount: 30 } },
	{ user_id: [user], points: { type: "preset", event: "split_low" } },
];

const achievements: AchievementParam[] = [
	{ achievement: "Maxed", type: "user_id", user_id: user },
	{ achievement: "Maxed", type: "rsn", rsn: rsn.name },
];

// Helper functions
async function clearData() {
	const u = await Requests.removeUser(guild, {
		type: "user_id",
		user_id: user,
	});
	if (u.error && u.status !== 404) throw new Error("Couldn't remove user");

	const g = await Requests.removeGuild(guild);
	if (g.error && g.status !== 404) throw new Error("Couldn't remove guild");
}

async function fillData() {
	await Requests.createGuild(guild);
	await Requests.createUser(guild, user, rsn.name);
}

function expectSuccess(
	res: ApiResponse<unknown>,
	expectedStatus: number | number[] = 200,
) {
	if (res.error) console.log(res);
	expect(res.error, "Returned an error").to.be.false;

	if (Array.isArray(expectedStatus)) {
		expect(res.status, "Unexpected status code").to.be.oneOf(expectedStatus);
	} else {
		expect(res.status, "Unexpected status code").to.equal(expectedStatus);
	}
}

// Test runner helper
function testEndpoint(
	description: string,
	apiCall: () => Promise<ApiResponse<unknown>>,
	expectedStatus: number | number[] = 200,
) {
	// biome-ignore lint/complexity/useArrowFunction: Mocha discourages arrow functions
	it(description, async function () {
		const res = await apiCall();
		expectSuccess(res, expectedStatus);
	});
}

describe("API Tests", function () {
	// Increase timeout for all tests due to external API calls
	this.timeout(10000);

	// biome-ignore lint/complexity/useArrowFunction: Mocha discourages arrow functions
	after(async function () {
		await clearData();
	});

	describe("POST Endpoints", function () {
		describe("Guild Endpoints", function () {
			// biome-ignore lint/complexity/useArrowFunction: Mocha discourages arrow functions
			before(async function () {
				await clearData();
			});

			testEndpoint(
				"should successfully create a guild",
				() => Requests.createGuild(guild),
				201,
			);
		});

		// biome-ignore lint/complexity/useArrowFunction: Mocha discourages arrow functions
		describe("User Endpoints", function () {
			testEndpoint(
				"should successfully create a user",
				() => Requests.createUser(guild, user, rsn.name),
				201,
			);

			testEndpoint(
				"should successfully add an rsn to a user",
				() => Requests.addRsn(guild, user, rsn.name),
				204,
			);
		});

		// biome-ignore lint/complexity/useArrowFunction: Mocha discourages arrow functions
		describe("Generic Endpoints", function () {
			testEndpoint(
				"should successfully give achievement",
				() => Requests.giveAchievement(achievements[0]),
				204,
			);

			testEndpoint(
				"should successfully add a new time",
				() => Requests.newTime(guild, new_time),
				[200, 201],
			);

			event_wins.forEach((event_win, _) => {
				const type = event_win.type === "individual" ? "individual" : "team";
				testEndpoint(
					`should successfully handle event winners (${type})`,
					() => Requests.eventWinners(guild, event_win),
					201,
				);
			});
		});
	});

	describe("GET Endpoints", function () {
		// biome-ignore lint/complexity/useArrowFunction: Mocha discourages arrow functions
		before(async function () {
			await clearData();
			await fillData();
		});

		// biome-ignore lint/complexity/useArrowFunction: Mocha discourages arrow functions
		describe("Guild endpoints", function () {
			const guildEndpoints = [
				{ desc: "return the guild", call: () => Requests.getGuild(guild) },
				{ desc: "get guild times", call: () => Requests.getGuildTimes(guild) },
				{ desc: "get events", call: () => Requests.getEvents(guild) },
				{ desc: "return all bosses", call: () => Requests.getBosses() },
			];

			for (const { desc, call } of guildEndpoints) {
				testEndpoint(`should successfully ${desc}`, call);
			}
		});

		// biome-ignore lint/complexity/useArrowFunction: Mocha discourages arrow functions
		describe("User endpoints", function () {
			testEndpoint("should successfully return the leaderboard", () =>
				Requests.getLeaderboard(guild),
			);

			user_queries.forEach((query, _) => {
				const queryType =
					query.type === "user_id"
						? "discord id"
						: query.type === "wom"
							? "wom id"
							: "rsn";
				testEndpoint(`should successfully get a user by ${queryType}`, () =>
					Requests.getUser(guild, query),
				);
			});

			for (const query of users_queries) {
				const queryType =
					query.type === "user_id"
						? "discord id array"
						: query.type === "wom"
							? "wom id array"
							: "rsn array";
				testEndpoint(
					`should successfully get multiple users by ${queryType}`,
					() => Requests.getUsers(guild, query),
				);
			}
		});

		// biome-ignore lint/complexity/useArrowFunction: Mocha discourages arrow functions
		describe("Generic endpoints", function () {
			const genericEndpoints = [
				{
					desc: "retrieve achievements",
					call: () => Requests.getAchievements(),
				},
				{
					desc: "retrieve a competition",
					call: () => Requests.getCompetition(competition),
				},
				{
					desc: "retrieve teamnames from competition",
					call: () => Requests.getCompetitionTeams(team_competition),
				},
				{
					desc: "handle event ending and points",
					call: () => Requests.eventCompetition(guild, competition, 3),
				},
			];

			for (const { desc, call } of genericEndpoints) {
				testEndpoint(`should successfully ${desc}`, call);
			}
		});
	});

	describe("DELETE Endpoints", function () {
		describe("User Endpoints", function () {
			// biome-ignore lint/complexity/useArrowFunction: Mocha discourages arrow functions
			beforeEach(async function () {
				await clearData();
				await fillData();
			});

			for (const query of user_queries) {
				const queryType =
					query.type === "user_id"
						? "discord id"
						: query.type === "wom"
							? "wom id"
							: "rsn";
				testEndpoint(
					`should successfully remove a user by ${queryType}`,
					() => Requests.removeUser(guild, query),
					204,
				);
			}

			testEndpoint(
				"should successfully remove an rsn from a user",
				() => Requests.removeRsn(guild, user, rsn.name),
				204,
			);
		});

		describe("Generic Endpoints", function () {
			// biome-ignore lint/complexity/useArrowFunction: Mocha discourages arrow functions
			beforeEach(async function () {
				await clearData();
				await fillData();
			});

			testEndpoint(
				"should successfully remove achievement",
				() => Requests.removeAchievement(achievements[0]),
				204,
			);
		});
	});

	describe("PUT Endpoints", function () {
		// biome-ignore lint/complexity/useArrowFunction: Mocha discourages arrow functions
		before(async function () {
			await clearData();
			await fillData();
		});

		describe("Points Endpoints", function () {
			points_queries.forEach((query, _) => {
				const type = query.points.type === "custom" ? "custom value" : "preset";
				testEndpoint(
					`should successfully give points to multiple by ${type}`,
					() => Requests.givePointsToMultiple(guild, query),
				);
			});

			// biome-ignore lint/complexity/useArrowFunction: Mocha discourages arrow functions
			for (const query of point_queries) {
				const type = query.points.type === "custom" ? "custom value" : "preset";
				testEndpoint(`should successfully give points by ${type}`, () =>
					Requests.givePoints(guild, query),
				);
			}
		});

		// biome-ignore lint/complexity/useArrowFunction: Mocha discourages arrow functions
		describe("Guild Endpoints", function () {
			testEndpoint(
				"should successfully update the guild",
				() => Requests.updateGuild(guild, guild_update),
				204,
			);
		});
	});
});
