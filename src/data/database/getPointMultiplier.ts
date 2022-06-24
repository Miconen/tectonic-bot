import createQuery from './createQuery.js';

const QUERY = `SELECT multiplier FROM guilds WHERE guild_id=?`;

const getPointMultiplier = async (guild_id: string) => {
	return await createQuery(QUERY, [guild_id])
		.then((res: any) => {
			return res;
		})
		.catch((err) => {
			throw err;
		});
};

export default getPointMultiplier;