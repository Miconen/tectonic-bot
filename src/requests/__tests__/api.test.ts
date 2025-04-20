import { expect } from "chai";
import { describe, it } from "mocha";
import type {
	AchievementParam,
	EventWinParam,
	GuildUpdate,
	NewTime,
	PointsParam,
	UserParam,
	UsersParam,
} from "@typings/requests";
import { Requests, fetchData } from "@requests/main";

describe("API Tests", () => {
	const guild = "test_guild";
	const user = "test_user";
	const rsn = { name: "Comfy hug", id: "39527" };
	const competition = 77922;
	const team_competition = 82737;

	const HAS_ERROR = "Rerturned an error";
	const WRONG_STATUS = "Unexpected status code";

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

	const event_win_individual: EventWinParam = {
		competition,
		type: "individual",
		top: 3,
	};

	const event_win_team: EventWinParam = {
		competition: team_competition,
		type: "team",
		team_names: ["Unlucky Charms"],
	};

	const user_id_query: UserParam = {
		type: "user_id",
		user_id: user,
	};

	const user_wom_query: UserParam = {
		type: "wom",
		wom: rsn.id,
	};

	const user_rsn_query: UserParam = {
		type: "rsn",
		rsn: rsn.name,
	};

	const users_id_query: UsersParam = {
		type: "user_id",
		user_id: [user],
	};

	const users_wom_query: UsersParam = {
		type: "wom",
		wom: [rsn.id],
	};

	const users_rsn_query: UsersParam = {
		type: "rsn",
		rsn: [rsn.name],
	};

	const point_query_custom: PointsParam = {
		user_id: user,
		points: {
			type: "custom",
			amount: 30,
		},
	};

	const point_query_preset: PointsParam = {
		user_id: user,
		points: {
			type: "preset",
			event: "split_low",
		},
	};

	const points_query_custom: PointsParam = {
		user_id: [user],
		points: {
			type: "custom",
			amount: 30,
		},
	};

	const points_query_preset: PointsParam = {
		user_id: [user],
		points: {
			type: "preset",
			event: "split_low",
		},
	};

	const achievement_by_id: AchievementParam = {
		achievement: "Maxed",
		type: "user_id",
		user_id: user,
	};

	const achievement_by_rsn: AchievementParam = {
		achievement: "Maxed",
		type: "rsn",
		rsn: rsn.name,
	};

	async function clearData() {
		// Remove pre-existing test user
		const users_url = `guilds/${guild}/${user}`;
		const users_options = { method: "DELETE" };
		await fetchData(users_url, users_options);

		// Remove pre-existing test guild
		const guilds_url = `guilds/${guild}`;
		const guilds_options = { method: "DELETE" };
		await fetchData(guilds_url, guilds_options);
	}

	async function fillData() {
		// Create test guild
		await Requests.createGuild(guild);
		await Requests.createUser(guild, user, rsn.name);
	}

	describe("POST Endpoints", async function () {
		before(async () => await clearData());

		describe("Guild Endpoints", async function () {
			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully create a guild", async function () {
				const res = await Requests.createGuild(guild);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(201);
			});
		});

		describe("User Endpoints", async function () {
			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully create a user", async function () {
				const res = await Requests.createUser(guild, user, rsn.name);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(201);
			});
			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully add an rsn to a user", async function () {
				const res = await Requests.addRsn(guild, user, rsn.name);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(204);
			});
		});

		describe("Generic Endpoints", async function () {
			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully give points by preset", async function () {
				const res = await Requests.giveAchievement(achievement_by_id);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(201);
			});
			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			// TODO: Requires functionality to be added first
			// it("should succesfully give points by preset", async function () {
			// 	const res = await Requests.giveAchievement(achievement_by_rsn);
			// 	expect(res.error, HAS_ERROR).to.be.false;
			// 	expect(res.status, WRONG_STATUS).to.equal(201);
			// });
			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully add a new time", async function () {
				const res = await Requests.newTime(guild, new_time);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.be.oneOf([200, 201]);
			});
			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully handle event winners", async function () {
				const res = await Requests.eventWinners(guild, event_win_individual);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(201);
			});
			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully handle team winners", async function () {
				const res = await Requests.eventWinners(guild, event_win_team);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(201);
			});
		});
	});

	describe("GET Endpoints", async function () {
		before(async () => {
			await clearData();
			await fillData();
		});

		describe("Guild endpoints", async function () {
			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully return the guild", async function () {
				const res = await Requests.getGuild(guild);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(200);
			});

			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully get guild times", async function () {
				const res = await Requests.getGuildTimes(guild);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(200);
			});

			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully get events", async function () {
				const res = await Requests.getEvents(guild);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(200);
			});

			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully return all bosses", async function () {
				const res = await Requests.getBosses();
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(200);
			});
		});

		describe("User endpoints", async function () {
			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully return the leaderboard", async function () {
				const res = await Requests.getLeaderboard(guild);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(200);
			});

			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully get a user by discord id", async function () {
				const res = await Requests.getUser(guild, user_id_query);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(200);
			});
			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully get a user by wom id", async function () {
				const res = await Requests.getUser(guild, user_wom_query);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(200);
			});
			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully get a user by rsn", async function () {
				const res = await Requests.getUser(guild, user_rsn_query);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(200);
			});
			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully get multiple users by discord id array", async function () {
				const res = await Requests.getUsers(guild, users_id_query);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(200);
			});
			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully get multiple users by wom id array", async function () {
				const res = await Requests.getUsers(guild, users_wom_query);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(200);
			});
			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully get multiple users by rsn array", async function () {
				const res = await Requests.getUsers(guild, users_rsn_query);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(200);
			});
		});

		describe("Generic endpoints", async function () {
			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully retrieve achievements", async function () {
				const res = await Requests.getAchievements();
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(200);
			});
			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully retrieve a competition", async function () {
				const res = await Requests.getCompetition(competition);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(200);
			});
			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully retrieve teamnames from competition", async function () {
				const res = await Requests.getCompetitionTeams(team_competition);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(200);
			});
			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully handle event ending and points", async function () {
				const res = await Requests.eventCompetition(guild, competition, 3);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(200);
			});
		});
	});

	describe("DELETE Endpoints", async function () {
		describe("User Endpoints", async function () {
			beforeEach(async () => {
				await clearData();
				await fillData();
			});

			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully remove a user by discord id", async function () {
				const res = await Requests.removeUser(guild, user_id_query);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(204);
			});
			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully remove a user by wom id", async function () {
				const res = await Requests.removeUser(guild, user_wom_query);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(204);
			});
			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully remove a user by rsn", async function () {
				const res = await Requests.removeUser(guild, user_rsn_query);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(204);
			});
			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully remove an rsn from a user", async function () {
				const res = await Requests.removeRsn(guild, user, rsn.name);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(204);
			});
		});

		describe("Generic Endpoints", async function () {
			beforeEach(async () => {
				await clearData();
				await fillData();
			});

			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully give points by preset", async function () {
				const res = await Requests.removeAchievement(achievement_by_id);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(204);
			});
			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			// TODO: Requires functionality to be added first
			// it("should succesfully give points by preset", async function () {
			// 	const res = await Requests.removeAchievement(achievement_by_rsn);
			// 	expect(res.error, HAS_ERROR).to.be.false;
			// 	expect(res.status, WRONG_STATUS).to.equal(204);
			// });
		});
	});

	describe("PUT Endpoints", async function () {
		before(async () => {
			await clearData();
			await fillData();
		});

		describe("Points Endpoints", async function () {
			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully give points to multiple by custom value", async function () {
				const res = await Requests.givePointsToMultiple(
					guild,
					points_query_custom,
				);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(200);
			});
			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully give points to multiple by preset", async function () {
				const res = await Requests.givePointsToMultiple(
					guild,
					points_query_preset,
				);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(200);
			});
			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully give points by custom value", async function () {
				const res = await Requests.givePoints(guild, point_query_custom);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(200);
			});
			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully give points by preset", async function () {
				const res = await Requests.givePoints(guild, point_query_preset);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(200);
			});
		});

		describe("Guild Endpoints", async function () {
			// biome-ignore lint/complexity/useArrowFunction: <Mocha discourages the usage of arrow functions: https://mochajs.org/#arrow-functions>
			it("should succesfully update the guild", async function () {
				const res = await Requests.updateGuild(guild, guild_update);
				expect(res.error, HAS_ERROR).to.be.false;
				expect(res.status, WRONG_STATUS).to.equal(204);
			});
		});
	});
});
