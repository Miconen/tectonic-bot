import dbQuery from './dbQuery.js';

const QUERY = `UPDATE users SET points=points+ ? WHERE (guild_id= ? AND user_id= ?)`;

const updateUserPoints = async (
	guild_id: string,
	user_id: string,
	points: number
) => {
	const result = await dbQuery(QUERY, [guild_id, user_id]);
	return result;
};

export default updateUserPoints;
