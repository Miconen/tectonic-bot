import pool from './pooling.js';

const CHECK_QUERY = `SELECT COUNT(1) FROM users WHERE (guild_id=$1 AND user_id=$2)`;

const checkIfActivated = async (
	guild_id: string,
	user_id: string,
	callback: (arg0: boolean) => void
) => {
	let result = false;
	const connection = await pool.connect();
	connection
		.query(CHECK_QUERY, [guild_id, user_id])
		.then((res) => {
			if (res.rows[0].count == 1) result = true;
			if (res.rows[0].count == 0) result = false;

			callback(result);
		})
		.catch((err) => {
			console.error(err);
		})
		.finally(() => {
			connection.release();
		});
};

export default checkIfActivated;
