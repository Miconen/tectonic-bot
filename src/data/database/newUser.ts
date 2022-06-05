import checkIfActivated from './checkIfActivated.js';
import createQuery from './createQuery.js';

const QUERY = `INSERT INTO users (guild_id, user_id)
				SELECT * FROM (SELECT ? as guild_id, ? as user_id) AS val
				WHERE NOT EXISTS (SELECT guild_id FROM users WHERE guild_id = ? AND user_id = ?) LIMIT 1;`;

const newUser = async (guild_id: string, user_id: string) => {
	// This .then checks if the user is already in the database
	// If not, it inserts the user into the database and returns true

	// userInDb = true/false based on if the user is in the database
	// Return = true/false based on if the user is new/not new
	let isInDb = await checkIfActivated(guild_id, user_id);
	if (isInDb) return false;
	await insertUser(guild_id, user_id);
	return true;
};

const insertUser = async (guild_id: string, user_id: string) => {
	return await createQuery(QUERY, [guild_id, user_id, guild_id, user_id])
		.then((res: any) => {
			return;
		})
		.catch((err) => {
			throw err;
		});
};

export default newUser;
