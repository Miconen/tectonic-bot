import pointsHandler from '../pointHandling.js';
import checkIfActivated from './checkIfActivated.js';
import createQuery from './createQuery.js';
import getPoints from './getPoints.js';

const QUERY = `UPDATE users SET points=points+ ? WHERE (guild_id= ? AND user_id= ?)`;

const updateUserPoints = async (
	guild_id: string,
	user_id: string,
	points: number
) => {
	// userInDb = true/false based on if the user is in the database
	// Return = number/false based on new points value or false if user is not in the database
	let isInDb = await checkIfActivated(guild_id, user_id);
	if (false == isInDb) return false;
	await queryUpdateUserPoints(guild_id, user_id, points);
	let newPoints = await getPoints(guild_id, user_id);
	return newPoints;
};

const queryUpdateUserPoints = async (
	guild_id: string,
	user_id: string,
	points: number
) => {
	return await createQuery(QUERY, [points, guild_id, user_id])
		.then((res: any) => {
			return;
		})
		.catch((err) => {
			throw err;
		});
};

export default updateUserPoints;
