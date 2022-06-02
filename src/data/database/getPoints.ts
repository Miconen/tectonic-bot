import pool from './pooling.js';

const SELECT_QUERY = `SELECT points FROM users WHERE (guild_id=$1 AND user_id=$2)`;

const getPoints = async (
	guild_id: string,
	user_id: string,
	callback: (arg0: number) => void
) => {
	let result = 0;
	const connection = await pool.connect();
	connection
		.query(SELECT_QUERY, [guild_id, user_id])
		.then((res) => {
			console.log(res.rows[0].points);

			//if (res.rows[0].points) result = res.rows[0].points;
			result = res.rows[0].points
			callback(result);
		})
		.catch((err) => {
			console.error(err);
		})
		.finally(() => {
			connection.release();
		});
};

export default getPoints;
