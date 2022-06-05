import createQuery from './createQuery.js';

const QUERY = `DELETE FROM users WHERE (guild_id= ? AND user_id= ?)`;

/**
 * Remove user from database
 * @param guild_id
 * @param user_id
 * @todo RETURN VALUES NOT IMPLEMENTED YET, ONLY RETURNS TRUE
 * @returns true if user was removed, false if user was not removed
 */
const removeUser = async (guild_id: string, user_id: string) => {
	return await createQuery(QUERY, [guild_id, user_id])
		.then((res: any) => {
			return true;
		})
		.catch((err) => {
			throw err;
		});
};

export default removeUser;
