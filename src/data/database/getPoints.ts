import dbQuery from './dbQuery.js';

const QUERY = `SELECT points FROM users WHERE (guild_id= ? AND user_id= ?)`;

const getPoints = async (
	guild_id: string,
	user_id: string,
	points: number = 0
) => {
	const result = await dbQuery(QUERY, [guild_id, user_id]);
	console.log(result);

	return result;
};

export default getPoints;
