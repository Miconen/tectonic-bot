import createQuery from './createQuery.js';

const QUERY = `SELECT COUNT(1) AS value FROM users WHERE (guild_id= ? AND user_id= ?)`;

/**
 * Checks if a user exists in the database
 * @param guild_id
 * @param user_id
 * @returns false if user is not in the database, true if user is in the database
 */
const checkIfActivated = async (guild_id: string, user_id: string) => {
	return await createQuery(QUERY, [guild_id, user_id])
		.then((res: any) => {
			if (res[0].value == 0) return false;
			if (res[0].value == 1) return true;
			throw new Error('Unexpected result');
		})
		.catch((err) => {
			throw err;
		});
};

export default checkIfActivated;
