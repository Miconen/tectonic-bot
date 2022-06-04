import dbQuery from './dbQuery.js';

const QUERY = `INSERT INTO users (guild_id, user_id)
				SELECT * FROM (SELECT ? as guild_id, ? as user_id) AS val
				WHERE NOT EXISTS (SELECT guild_id FROM users WHERE guild_id = ? AND user_id = ?) LIMIT 1;`;

const newUser = async (guild_id: string, user_id: string) => {
	const result = await dbQuery(QUERY, [guild_id, user_id]);
	return result;
};

export default newUser;
