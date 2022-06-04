import dbQuery from './dbQuery.js';

const QUERY = `SELECT COUNT(1) FROM users WHERE (guild_id= ? AND user_id= ?)`;

const checkIfActivated = async (guild_id: string, user_id: string) => {
	const result = await dbQuery(QUERY, [guild_id, user_id]);
	return result;
};

export default checkIfActivated;
