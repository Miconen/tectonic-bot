import createQuery from './createQuery.js';

const QUERY = `SELECT points FROM users WHERE (guild_id= ? AND user_id= ?)`;

const getPoints = async (guild_id: string, user_id: string) => {
	return await createQuery(QUERY, [guild_id, user_id])
		.then((res: any) => {
			return res[0].points;
		})
		.catch((err) => {
			throw err;
		});
};

export default getPoints;
