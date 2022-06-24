import createQuery from './createQuery.js';

const QUERY = `SELECT rsn, type FROM rsn WHERE user=(SELECT id FROM users WHERE guild_id=? AND user_id=?)`;

const getRsn = async (guild_id: string, user_id: string) => {
	return await createQuery(QUERY, [guild_id, user_id])
		.then((res: any) => {
			return res;
		})
		.catch((err) => {
			throw err;
		});
};

export default getRsn;