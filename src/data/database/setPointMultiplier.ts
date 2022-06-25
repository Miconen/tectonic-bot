import createQuery from './createQuery.js';

const QUERY = `REPLACE INTO guilds(guild_id, multiplier) VALUES (?,?)`;

const setPointMultiplier = async (multiplier: number, guild_id: string) => {
	return await createQuery(QUERY, [guild_id, multiplier])
		.then((res: any) => {
			return res;
		})
		.catch((err) => {
			throw err;
		});
};

export default setPointMultiplier;