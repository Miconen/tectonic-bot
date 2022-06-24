import createQuery from './createQuery.js';

const QUERY = `REPLACE INTO rsn(user, rsn, type) VALUES ((SELECT id FROM users WHERE guild_id=? AND user_id=?), ?, ?)`;

const setRsn = async (guild_id: string, user_id: string, rsn: string, type: string) => {
	return await createQuery(QUERY, [guild_id, user_id, rsn, type])
		.then((res: any) => {
			return true;
		})
		.catch((err) => {
			throw err;
		}) 
};

export default setRsn;