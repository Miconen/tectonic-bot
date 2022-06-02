import pool from './pooling.js';

const UPDATE_QUERY =
	'UPDATE users SET points=points+$3 WHERE (guild_id=$1 AND user_id=$2) RETURNING points';

const updateUserPoints = async (
	guild_id: string,
	user_id: string,
	points: number,
	callback: (arg0: number) => void
) => {
	let result = 0;
	const connection = await pool.connect();
	await connection
		.query(UPDATE_QUERY, [guild_id, user_id, points])
		.then((res) => {
			if (res.rowCount === 0) {
				console.log(
					`User ${user_id} does not exist in guild ${guild_id}`
				);
				result = 0;
			} else {
				console.log(`Updated user ${user_id} in guild ${guild_id}`);
				result = res.rows[0].points;
			}

			callback(result);
		})
		.catch((err) => {
			console.error(err);
		})
		.finally(() => {
			connection.release();
		});
};

export default updateUserPoints;
